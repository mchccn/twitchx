import EventEmitter from "events";
import lt from "long-timeout";
import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { ChannelManager, EmoteManager, UserManager } from "../classes/";
import { ExternalError, HTTPError, InternalError, MILLISECONDS, snakeCasify, TwitchAPIError } from "../shared";
import type {
    Awaited,
    ClientEvents,
    ClientOptions,
    ClientScope,
    ErrorResponse,
    LoginResponse,
    ValidateResponse,
} from "../types";

export default class Client extends EventEmitter {
    private accessToken?: string;
    private refreshToken?: string;

    private loginTimeout?: lt.Timeout;
    private validateInterval?: lt.Interval;

    private timeouts = new Set<lt.Timeout>();
    private intervals = new Set<lt.Interval>();

    public readonly options: Required<Omit<ClientOptions, "redirectUri" | "forceVerify" | "state">> & {
        redirectUri?: string;
        forceVerify?: boolean;
        state?: string;
    };
    public readonly scope: ClientScope[];

    public readonly channels: ChannelManager;
    public readonly users: UserManager;
    public readonly emotes: EmoteManager;

    private authType?: "app" | "user";

    public constructor(options: ClientOptions) {
        super({
            captureRejections: options.suppressRejections ?? false,
        });

        this.options = {
            debug: false,
            scope: [],
            suppressRejections: false,
            update: {
                users: MILLISECONDS.DAY,
                channels: MILLISECONDS.HOUR,
                emotes: MILLISECONDS.HOUR,
                channelEmotes: MILLISECONDS.HOUR,
            },
            ttl: {
                users: MILLISECONDS.WEEK,
                channels: MILLISECONDS.DAY,
                emotes: MILLISECONDS.DAY,
                channelEmotes: MILLISECONDS.DAY,
            },
            ...options,
        };

        this.scope = this.options.scope ?? [];

        this.channels = new ChannelManager(this);
        this.users = new UserManager(this);
        this.emotes = new EmoteManager(this);
    }

    public async login(): Promise<void>;
    public async login(oauth: "implicit"): Promise<{ url: string; callback: (token: string) => Promise<void> }>;
    public async login(oauth: "authorization"): Promise<{ url: string; callback: (code: string) => Promise<void> }>;
    public async login(
        oauth?: "implicit" | "authorization"
    ): Promise<
        | void
        | { url: string; callback: (token: string) => Promise<void> }
        | { url: string; callback: (code: string) => Promise<void> }
    > {
        if (typeof oauth === "undefined") {
            const { clientId, clientSecret } = this.options;

            const response = await fetch(
                `https://id.twitch.tv/oauth2/token?${new URLSearchParams(
                    snakeCasify({
                        clientId,
                        clientSecret,
                        scope: this.scope.join(" "),
                        grantType: "client_credentials",
                    })
                ).toString()}`,
                {
                    method: "POST",
                }
            ).catch((e) => {
                throw new HTTPError(e);
            });

            if (!response.ok) throw new HTTPError("unable to login");

            const data: LoginResponse & ErrorResponse = await response.json();

            if (data.status && data.status !== 200)
                throw new TwitchAPIError(`(${data.status}) ${data.message ?? `unable to login`}`);

            if (!data.access_token) throw new TwitchAPIError(`unable to obtain access token`);

            this.accessToken = data.access_token;

            this.loginTimeout = lt.setTimeout(this.login.bind(this), (data.expires_in ?? 3600) * 1000 * 0.9);
            this.validateInterval = lt.setInterval(this.validate.bind(this), 3600 * 1000 * 0.9);

            this.emit("ready");

            this.authType = "app";

            return;
        }

        if (oauth === "implicit") {
            if (!this.options.redirectUri) throw new ExternalError(`no redirect uri provided`);

            this.authType = "user";

            return {
                url: `https://id.twitch.tv/oauth2/authorize?client_id=${new URLSearchParams(
                    snakeCasify({
                        clientId: this.options.clientId,
                        redirectUri: this.options.redirectUri,
                        responseType: "token",
                        scope: this.options.scope.join(" "),
                        forceVerify:
                            typeof this.options.forceVerify !== "undefined"
                                ? this.options.forceVerify?.toString()
                                : undefined,
                        state: this.options.state,
                    })
                ).toString()}`,
                callback: async (token: string) => {
                    if (!(await this.validate({ token }))) throw new ExternalError(`invalid token provided`);

                    this.accessToken = token;

                    return;
                },
            };
        }

        if (oauth === "authorization") {
            this.authType = "user";

            return {
                url: `https://id.twitch.tv/oauth2/authorize?client_id=${new URLSearchParams(
                    snakeCasify({
                        clientId: this.options.clientId,
                        redirectUri: this.options.redirectUri,
                        responseType: "code",
                        scope: this.options.scope.join(" "),
                        forceVerify:
                            typeof this.options.forceVerify !== "undefined"
                                ? this.options.forceVerify?.toString()
                                : undefined,
                        state: this.options.state,
                    })
                ).toString()}`,
                callback: async (code: string) => {
                    const response = await fetch(
                        `https://id.twitch.tv/oauth2/token?${new URLSearchParams(
                            snakeCasify({
                                clientId: this.options.clientId,
                                clientSecret: this.options.clientSecret,
                                code,
                                grantType: "authorization_code",
                                redirectUri: this.options.redirectUri,
                            })
                        ).toString()}`,
                        {
                            method: "POST",
                        }
                    ).catch((e) => {
                        throw new HTTPError(e);
                    });

                    const data: LoginResponse & ErrorResponse = await response.json();

                    if (!response.ok || data.status !== 200 || data.message)
                        throw new HTTPError(`unable to retrieve token with authorization code`);

                    this.accessToken = data.access_token;
                    this.refreshToken = data.refresh_token;

                    this.validateInterval = lt.setInterval(
                        this.refresh.bind(this),
                        (data.expires_in ?? 3600) * 1000 * 0.9
                    );
                },
            };
        }

        throw new Error(`invalid oauth type; valid types are 'implicit' and 'authorization'`);
    }
    public async destroy() {
        if (this.accessToken)
            await fetch(
                `https://id.twitch.tv/oauth2/revoke?${new URLSearchParams(
                    snakeCasify({
                        clientId: this.options.clientId,
                        token: this.accessToken,
                    })
                ).toString()}`,
                {
                    method: "POST",
                }
            ).catch((e) => {
                throw new HTTPError(e);
            });

        for (const timeout of this.timeouts) lt.clearTimeout(timeout);
        for (const interval of this.intervals) lt.clearInterval(interval);

        this.accessToken = undefined;

        this.timeouts.clear();
        this.intervals.clear();

        if (this.loginTimeout) lt.clearTimeout(this.loginTimeout);
        if (this.validateInterval) lt.clearInterval(this.validateInterval);

        this.loginTimeout = undefined;
        this.validateInterval = undefined;

        this.emit("destroy");
    }

    private async refresh() {
        if (!this.refreshToken) {
            if (!this.options.suppressRejections)
                throw new InternalError(`attempted to refresh access token when no refresh token was available`);

            return;
        }

        const response = await fetch(
            `https://id.twitch.tv/oauth2/token?${new URLSearchParams(
                snakeCasify({
                    clientId: this.options.clientId,
                    clientSecret: this.options.clientSecret,
                    grantType: "refresh_token",
                    refreshToken: this.refreshToken,
                })
            ).toString()}`,
            {
                method: "POST",
            }
        ).catch((e) => {
            throw new HTTPError(e);
        });

        if (!response.ok) throw new HTTPError("unable to login");

        const data: LoginResponse & ErrorResponse = await response.json();

        if (data.status && data.status !== 200)
            throw new TwitchAPIError(`(${data.status}) ${data.message ?? `unable to login`}`);

        if (!data.access_token) throw new TwitchAPIError(`unable to obtain access token`);

        this.clearTimeout(this.loginTimeout!);
        this.clearInterval(this.validateInterval!);

        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;

        return;
    }

    private async validate({ relogin, token }: { relogin?: boolean; token?: string } = {}) {
        const response = await fetch(`https://id.twitch.tv/oauth2/validate`, {
            headers: {
                authorization: `OAuth ${token ?? this.accessToken}`,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (!response.ok) {
            if (!this.options.suppressRejections) throw new TwitchAPIError(`unable to validate access token`);

            return false;
        }

        const data: ValidateResponse & ErrorResponse = await response.json();

        if (data.status && data.status !== 200 && (relogin ?? true)) {
            this.emit("debug", `[Client] Access token validation failed. Retrying login...`);

            this.clearTimeout(this.loginTimeout!);
            this.clearInterval(this.validateInterval!);

            await this.login();

            return false;
        }

        return true;
    }

    public get token() {
        return this.accessToken;
    }

    public setInterval(...args: Parameters<typeof lt.setInterval>) {
        const interval = lt.setInterval(...args);

        this.intervals.add(interval);

        return interval;
    }

    public setTimeout(...args: Parameters<typeof lt.setTimeout>) {
        const timeout = lt.setTimeout(...args);

        this.timeouts.add(timeout);

        return timeout;
    }

    public clearInterval(...args: Parameters<typeof lt.clearInterval>) {
        lt.clearInterval(...args);

        this.intervals.delete(...args);

        return;
    }

    public clearTimeout(...args: Parameters<typeof lt.clearTimeout>) {
        lt.clearTimeout(...args);

        this.timeouts.delete(...args);

        return;
    }

    public get type() {
        return this.authType;
    }

    public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaited<unknown>): this;
    public on<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => Awaited<void>
    ): this {
        return super.on(event, listener);
    }

    public once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaited<unknown>): this;
    public once<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => Awaited<void>
    ): this {
        return super.once(event, listener);
    }

    public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
    public emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }
}
