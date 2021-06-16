import { Channel } from "diagnostic_channel";
import EventEmitter from "events";
import lt from "long-timeout";
import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { ChannelManager, EmoteManager, UserManager, User } from "../classes/";
import ClientUser from "../classes/users/ClientUser";
import { ExternalError, HTTPError, InternalError, MILLISECONDS, snakeCasify, TwitchAPIError } from "../shared";
import type {
    Awaited,
    ClientEvents,
    ClientOptions,
    ClientScope,
    ErrorResponse,
    LoginResponse,
    UserData,
    ValidateResponse,
} from "../types";

/**
 * The main client to interact with the Twitch API.
 * Supports app and user access tokens and is configurable.
 * Delegates API endpoints to different managers.
 * @class
 * @extends EventEmitter
 */
export default class Client extends EventEmitter {
    private accessToken?: string;
    private refreshToken?: string;

    private loginTimeout?: lt.Timeout;
    private validateInterval?: lt.Interval;

    private timeouts = new Set<lt.Timeout>();
    private intervals = new Set<lt.Interval>();

    /**
     * Options given to the client.
     * @readonly
     */
    public readonly options: Required<Omit<ClientOptions, "redirectUri" | "forceVerify" | "state">> & {
        redirectUri?: string;
        forceVerify?: boolean;
        state?: string;
    };

    /**
     * Client's token's current scopes.
     * @readonly
     */
    public readonly scope: ClientScope[];

    /**
     * Client's channel manager.
     * @readonly
     */
    public readonly channels: ChannelManager;

    /**
     * Client's user manager.
     * @readonly
     */
    public readonly users: UserManager;

    /**
     * Client's emote manager.
     * @readonly
     */
    public readonly emotes: EmoteManager;

    public user: ClientUser|null;

    private authType?: "app" | "user";

    /**
     * Creates a new client to interact with the Twitch API.
     * @param options Options for the client.
     */
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
        this.user = null;

    }

    /**
     * Logs in the client and retrieves an app access token.
     *
     * @example
     * ```js
     * const token = await client.login();
     * ```
     */
    public async login(): Promise<string>;
    /**
     * Uses the OAuth implicit credentials flow to generate a URL and callback.
     * @param oauth Must be `"implicit"` to use the implicit credentials flow.
     *
     * @example
     * ```js
     * const { url, callback } = await client.login("implicit");
     *
     * app.get("/auth/twitch", (req, res) => {
     *     res.redirect(url);
     * });
     *
     * app.get("/auth/twitch/callback", (req, res) => {
     *     callback(new URL(req.protocol + '://' + req.get('host') + req.originalUrl).hash.slice("access_token=".length + 1));
     * });
     * ```
     */
    public async login(oauth: "implicit"): Promise<{ url: string; callback: (token: string) => Promise<void> }>;
    /**
     * Uses the OAuth authorization credentials flow to generate a URL and callback.
     * @param oauth Must be `"authorization"` to use the authorization credentials flow.
     *
     * @example
     * ```js
     * const { url, callback } = await client.login("authorization");
     *
     * app.get("/auth/twitch", (req, res) => {
     *     res.redirect(url);
     * });
     *
     * app.get("/auth/twitch/callback", (req, res) => {
     *     callback(new URL(req.protocol + '://' + req.get('host') + req.originalUrl).searchParams.get("code"));
     * });
     * ```
     */
    public async login(oauth: "authorization"): Promise<{ url: string; callback: (code: string) => Promise<void> }>;
    /**
     * Logs in the client and retrieves an app access token.
     *
     * @example
     * ```js
     * const token = await client.login();
     * ```
     *
     * @returns {Promise<string | object>} The new access token or OAuth details object.
     */
    public async login(
        oauth?: "implicit" | "authorization"
    ): Promise<
        | string
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

            this.authType = "app";
            
            this.emit("ready");
            
            return this.accessToken;
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

                    if (this.token) {   
                        const res = await fetch(`https://api.twitch.tv/helix/users`, { headers: { Authorization: `Bearer ${this.token}`, "Client-Id": this.options.clientId } });
                        if (res.ok) {
                            const data: UserData = (await res.json()).data[0];
                            this.user = new ClientUser(this, data)
                        }
                    }
                    this.emit("ready");


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

                    if (this.token) {
                        const res = await fetch(`https://api.twitch.tv/helix/users`, { headers: { Authorization: `Bearer ${this.token}` , "Client-Id": this.options.clientId } });
                        if (res.ok) {
                            const data: UserData = (await res.json()).data[0];
                            this.user = new ClientUser(this, data)
                        }
                    }
                    
                    this.emit("ready");

                },
            };
        }



        throw new Error(`invalid oauth type; valid types are 'implicit' and 'authorization'`);
    }

    /**
     * Destroys the client and revokes its access token.
     *
     * TODO: Add a destroy method on managers as well and call it here.
     * @returns {Promise<void>} Nothing.
     */
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

    /**
     * Current token being used.
     * @type {string}
     * @readonly
     */
    public get token() {
        return this.accessToken;
    }

    /**
     * Authentication type; either `"app"` or `"user"`.
     * @type {string}
     * @readonly
     */
    public get type() {
        return this.authType;
    }

    /**
     * Sets an interval to be managed by the client.
     */
    public setInterval(...args: Parameters<typeof lt.setInterval>) {
        const interval = lt.setInterval(...args);

        this.intervals.add(interval);

        return interval;
    }

    /**
     * Sets a timeout to be managed by the client.
     */
    public setTimeout(...args: Parameters<typeof lt.setTimeout>) {
        const timeout = lt.setTimeout(...args);

        this.timeouts.add(timeout);

        return timeout;
    }

    /**
     * Clears an interval managed by the client.
     */
    public clearInterval(...args: Parameters<typeof lt.clearInterval>) {
        lt.clearInterval(...args);

        this.intervals.delete(...args);

        return;
    }

    /**
     * Clears a timeout managed by the client.
     */
    public clearTimeout(...args: Parameters<typeof lt.clearTimeout>) {
        lt.clearTimeout(...args);

        this.timeouts.delete(...args);

        return;
    }

    /**
     * Adds an event listener to the client.
     * @param event Event to listen to.
     * @param listener Callback for the event.
     * @returns {Client} The client instance.
     */
    public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaited<unknown>): this;
    /**
     * Adds an event listener to the client.
     * @param event Event to listen to.
     * @param listener Callback for the event.
     * @returns {Client} The client instance.
     */
    public on<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => Awaited<void>
    ): this {
        return super.on(event, listener);
    }

    /**
     * Adds an event listener to the client, but the listener gets removed as soon as an event is received.
     * @param event Event to listen to.
     * @param listener Callback for the event.
     * @returns {Client} The client instance.
     */
    public once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaited<unknown>): this;
    /**
     * Adds an event listener to the client, but the listener gets removed as soon as an event is received.
     * @param event Event to listen to.
     * @param listener Callback for the event.
     * @returns {Client} The client instance.
     */
    public once<S extends string | symbol>(
        event: Exclude<S, keyof ClientEvents>,
        listener: (...args: any[]) => Awaited<void>
    ): this {
        return super.once(event, listener);
    }

    /**
     * Emits a new event on the client to be captured by its listeners.
     * @param event Event to emit.
     * @param args Data for the event.
     */
    public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
    public emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }

    public async follow(user: User|string, channel: Channel|string): Promise<void>{
        const userId = (user instanceof User ? user.id : user);
        const channelId = (channel instanceof Channel ? channel.subscribe : channel);

        if (!userId || !channelId) throw new Error("Both channel and user params are required.");

        if (!this.token) throw new InternalError(`token is not available`);

        const res = await fetch(`https://api.twitch.tv/helix/users/follows?${new URLSearchParams(snakeCasify({ from_id: userId, to_id: channelId }))}`, {
            headers: {
                authorization: `Bearer ${this.token}`,
                "client-id": this.options.clientId,
            }, method: 'post'
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (!res.ok) throw new HTTPError(res.statusText);
        return;
    }

    public async unfollow(user: User|string, channel: Channel|string) {
        const userId = (user instanceof User ? user.id : user);
        const channelId = (channel instanceof Channel ? channel.subscribe : channel);

        if (!userId || !channelId) throw new Error("Both channel and user params are required.");

        if (!this.token) throw new InternalError(`token is not available`);

        const res = await fetch(`https://api.twitch.tv/helix/users/follows?${new URLSearchParams(snakeCasify({ from_id: userId, to_id: channelId }))}`, {
            headers: {
                authorization: `Bearer ${this.token}`,
                "client-id": this.options.clientId,
            }, method: 'delete'
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (!res.ok) throw new HTTPError(res.statusText);
        return;
    }
}
