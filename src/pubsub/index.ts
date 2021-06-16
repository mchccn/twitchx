import ws, { EventEmitter } from "ws";
import type { Client } from "../base/internal";
import { ExternalError, InternalError, NONCE_CHARACTERS, TwitchAPIError, WebSocketError } from "../shared";
import { Awaited, ClientPubSubEvent, PubSubOptions, ServerPubSubResponse } from "../types";

export default class PubSub extends EventEmitter {
    private readonly ws: ws;
    private pingInterval?: NodeJS.Timer;
    private currentData = "";

    private listening = new Map<string, ((data: any) => Awaited<void>)[]>();

    private queue = [] as {
        event: ClientPubSubEvent;
        callback: (data: any) => Awaited<void>;
    }[];

    public readonly client;

    public readonly options: PubSubOptions;

    constructor(client: Client, options?: PubSubOptions) {
        super({
            captureRejections: client.options.suppressRejections,
        });

        this.options = {
            suppressRejections: false,
            ws: {},
            ...options,
        };

        this.client = client;

        this.ws = new ws("wss://pubsub-edge.twitch.tv", this.options.ws);

        this.ws.on("open", () => {
            this.pingInterval = setInterval(this.ping.bind(this), 1000 * 60 * 5 * 0.9);
        });

        this.ws.on("message", (data) => {
            try {
                this.currentData += data.toString("utf8");

                const response: ServerPubSubResponse = JSON.parse(this.currentData);

                switch (response.type) {
                    case "PONG": {
                        const ping = this.queue[this.queue.findIndex(({ event }) => event === "PING")];

                        if (!ping) break;

                        ping.callback(response);

                        break;
                    }

                    case "RESPONSE": {
                        const listen =
                            this.queue[this.queue.findIndex(({ event }) => event === "LISTEN" || event === "UNLISTEN")];

                        if (!listen) break;

                        if (response.error) {
                            if (!this.options.suppressRejections && !this.client.options.suppressRejections) {
                                switch (response.error) {
                                    case "ERR_BADAUTH":
                                        throw new TwitchAPIError(`PubSub authentication failed`);
                                    case "ERR_BADMESSAGE":
                                        throw new InternalError(`bad message sent`);
                                    case "ERR_BADTOPIC":
                                        throw new ExternalError(`incorrect topic to listen to`);
                                    case "ERR_SERVER":
                                        throw new TwitchAPIError(`server error occured`);
                                    default:
                                        throw new InternalError(`unrecognized error type`);
                                }
                            }

                            break;
                        }

                        listen.callback(response);

                        break;
                    }

                    case "MESSAGE": {
                        const data =
                            typeof response.data.message === "string"
                                ? JSON.parse(response.data.message)
                                : response.data.message;

                        this.listening.get(response.data.topic)?.forEach((cb) => cb(data));

                        break;
                    }

                    default: {
                        if (!this.options.suppressRejections && !this.client.options.suppressRejections)
                            throw new InternalError(`unknown response type`);
                    }
                }

                this.currentData = "";
            } catch {}
        });

        this.ws.on("close", (code, reason) => {
            if (code) {
                if (!this.options.suppressRejections && !this.client.options.suppressRejections)
                    throw new WebSocketError(`pubsub websocket closed with code ${code} for reason '${reason}'`);
            }

            if (this.pingInterval) clearInterval(this.pingInterval);

            this.currentData = "";
        });

        if (!this.options.suppressRejections && !this.client.options.suppressRejections)
            this.ws.on("error", (error) => {
                throw new WebSocketError(error.message);
            });
    }

    public async ping() {
        this.ws.send(
            JSON.stringify({
                type: "PING",
            }),
            (err) => {
                if (err && !this.options.suppressRejections && !this.client.options.suppressRejections)
                    throw new WebSocketError(`unable to send message`);
            }
        );

        this.queue.push({
            event: "PING",
            callback() {},
        });
    }

    public async listen(topics: string | string[], unlisten?: boolean) {
        if (this.client.type !== "user") throw new ExternalError(`client must have an oauth token to use PubSub`);

        const nonce = new Array(15)
            .fill("")
            .map(() => NONCE_CHARACTERS[Math.floor(Math.random() * NONCE_CHARACTERS.length)])
            .join("");

        this.ws.send(
            JSON.stringify({
                type: unlisten ? "UNLISTEN" : "LISTEN",
                nonce,
                data: {
                    topics: typeof topics === "string" ? [topics] : topics,
                    auth_token: this.client.token,
                },
            }),
            (err) => {
                if (err && !this.options.suppressRejections && !this.client.options.suppressRejections)
                    throw new WebSocketError(`unable to send message`);
            }
        );
    }
}
