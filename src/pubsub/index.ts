import ws from "ws";
import type { Client } from "../base/internal";
import { ServerPubSubResponse } from "../types";

export default class PubSub {
    private readonly ws = new ws("wss://pubsub-edge.twitch.tv", {});
    private pingInterval?: NodeJS.Timer;
    private currentData = "";

    constructor(private readonly client: Client) {
        this.ws.on("open", () => {
            this.pingInterval = setInterval(this.ping.bind(this), 1000 * 60 * 5 * 0.9);
        });

        this.ws.on("message", (data) => {
            try {
                this.currentData += data.toString("utf8");

                const response: ServerPubSubResponse = JSON.parse(this.currentData);

                switch (response.type) {
                    case "PONG": {
                        console.log("pinged");

                        break;
                    }

                    default: {
                        // ! unknown response type
                        console.log(response.type);
                    }
                }

                this.currentData = "";
            } catch {}
        });

        this.ws.on("close", (code, reason) => {
            if (code) {
                // ! error occured
            }

            if (this.pingInterval) clearInterval(this.pingInterval);

            this.currentData = "";
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
