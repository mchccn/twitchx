import EventEmitter from "events";
import lt from "long-timeout";
import fetch from "node-fetch";
import { URLSearchParams } from "url";
import ChannelManager from "../classes/channels/ChannelManager";
import EmoteManager from "../classes/emotes/EmoteManager";
import UserManager from "../classes/users/UserManager";
import { snakeCasify } from "../shared";
import { MILLISECONDS } from "../shared/constants";
import { HTTPError, TwitchAPIError } from "../shared/errors";
import {
    ClientEvents,
    ClientOptions,
    ClientScope,
    ErrorResponse,
    LoginResponse,
    ValidateResponse,
} from "../types/base";
import { Awaited } from "../types/utils";

export default class Client extends EventEmitter {
    private accessToken?: string;

    private loginTimeout?: lt.Timeout;
    private validateInterval?: lt.Interval;

    private timeouts = new Set<lt.Timeout>();
    private intervals = new Set<lt.Interval>();

    public readonly options: Required<Omit<ClientOptions, "redirectUri">> & { redirectUri?: string };
    public readonly scope: ClientScope[];

    public readonly channels: ChannelManager;
    public readonly users: UserManager;
    public readonly emotes: EmoteManager;

    public constructor(options: ClientOptions) {
        super({
            captureRejections: options.suppressRejections ?? false,
        });

        this.options = {
            debug: false,
            scope: [],
            suppressRejections: false,
            update: { users: MILLISECONDS.DAY, channels: MILLISECONDS.HOUR },
            ttl: { users: MILLISECONDS.WEEK, channels: MILLISECONDS.DAY },
            ...options,
        };

        this.scope = this.options.scope ?? [];

        this.channels = new ChannelManager(this);
        this.users = new UserManager(this);
        this.emotes = new EmoteManager(this);
    }

    public async login() {
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

        if (!response.ok) throw new HTTPError("Unable to login");

        const data: LoginResponse & ErrorResponse = await response.json();

        if (data.status && data.status !== 200)
            throw new TwitchAPIError(`(${data.status}) ${data.message ?? `unable to login`}`);

        if (!data.access_token) throw new TwitchAPIError(`unable to obtain access token`);

        this.accessToken = data.access_token;

        this.loginTimeout = lt.setTimeout(this.login.bind(this), (data.expires_in ?? 3600) * 1000 * 0.9);
        this.validateInterval = lt.setInterval(this.validate.bind(this), 3600 * 1000 * 0.9);

        this.emit("ready");

        return;
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

    private async validate() {
        const response = await fetch(`https://id.twitch.tv/oauth2/validate`, {
            headers: {
                authorization: `OAuth ${this.accessToken}`,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (!response.ok) {
            if (!this.options.suppressRejections) throw new TwitchAPIError(`unable to validate access token`);

            return;
        }

        const data: ValidateResponse & ErrorResponse = await response.json();

        if (data.status && data.status !== 200) {
            this.emit("debug", `[Client] Access token validation failed. Retrying login...`);

            lt.clearTimeout(this.loginTimeout!);
            lt.clearInterval(this.validateInterval!);

            await this.login();
        }

        return;
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
