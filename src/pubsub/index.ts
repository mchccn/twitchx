import ws from "ws";
import type { Client } from "../base/internal";
import { WebSocketError } from "../shared";
import { PubSubOptions, ServerPubSubResponse } from "../types";

export default class PubSub {
    private readonly ws: ws;
    private pingInterval?: NodeJS.Timer;
    private currentData = "";

    public readonly options: PubSubOptions;

    constructor(public readonly client: Client, options?: PubSubOptions) {
        this.options = {
            suppressRejections: false,
            ws: {},
            ...options,
        };

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
                        break;
                    }

                    default: {
                        // ! unknown response type
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
            })
        );
    }
}
