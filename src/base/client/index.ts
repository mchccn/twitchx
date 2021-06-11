import EventEmitter from "events";
import lt from "long-timeout";
import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { snakeCasify } from "../../shared";
import { ClientEvents, ClientOptions, ClientScope, ErrorResponse, LoginResponse, ValidateResponse } from "../../types/base";
import { Awaited } from "../../types/utils";

export default class Client extends EventEmitter {
    private accessToken?: string;

    private loginTimeout?: lt.Timeout;
    private validateInterval?: lt.Interval;

    public readonly scope: ClientScope[];

    public constructor(private readonly options: ClientOptions) {
        super({});

        this.scope = this.options.scope ?? [];
    }

    public async login() {
        const { clientId, clientSecret } = this.options;

        const response: LoginResponse & ErrorResponse = await (
            await fetch(
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
            )
        ).json();

        if (response.status && response.status !== 200) throw new Error(`(${response.status}) ${response.message ?? `unable to login`}`);

        if (!response.access_token) throw new Error(`unable to obtain access token`);

        this.accessToken = response.access_token;

        this.loginTimeout = lt.setTimeout(this.login.bind(this), (response.expires_in ?? 3600) * 1000 * 0.9);
        this.validateInterval = lt.setInterval(this.validate.bind(this), 3600 * 1000 * 0.9);

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
            );

        if (this.loginTimeout) lt.clearTimeout(this.loginTimeout);
        if (this.validateInterval) lt.clearInterval(this.validateInterval);

        this.accessToken = undefined;

        this.loginTimeout = undefined;
        this.validateInterval = undefined;
    }

    private async validate() {
        const response: ValidateResponse & ErrorResponse = await (
            await fetch(`https://id.twitch.tv/oauth2/validate`, {
                headers: {
                    authorization: `OAuth ${this.accessToken}`,
                },
            })
        ).json();

        if (response.status && response.status !== 200) {
            lt.clearTimeout(this.loginTimeout!);
            lt.clearInterval(this.validateInterval!);

            await this.login();
        }

        return;
    }

    public on<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaited<void>): this;
    public on<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, listener: (...args: any[]) => Awaited<void>): this {
        return super.on(event, listener);
    }

    public once<K extends keyof ClientEvents>(event: K, listener: (...args: ClientEvents[K]) => Awaited<void>): this;
    public once<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, listener: (...args: any[]) => Awaited<void>): this {
        return super.once(event, listener);
    }

    public emit<K extends keyof ClientEvents>(event: K, ...args: ClientEvents[K]): boolean;
    public emit<S extends string | symbol>(event: Exclude<S, keyof ClientEvents>, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }
}
