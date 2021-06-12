import AbortController from "abort-controller";
import fetch from "node-fetch";
import { Client } from "../../base";
import Manager from "../../base/Manager";
import { BASE_URL, MILLISECONDS } from "../../shared/constants";
import Channel from "./Channel";

export default class ChannelManager extends Manager<Channel> {
    constructor(public readonly client: Client) {
        super(client, {
            update: MILLISECONDS.HOUR,
            ttl: MILLISECONDS.DAY,
        });
    }

    public get(id: string) {
        return this.cache.get(id);
    }

    public async fetch(id: string, force?: boolean) {
        if (this.cache.has(id) && !force) return this.get(id);

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 1000);

        try {
            const response = await fetch(`${BASE_URL}/channels?broadcaster_id=${id}`, {
                headers: {
                    authorization: `Bearer ${this.client.token}`,
                    "client-id": this.client.options.clientId,
                },
                signal: controller.signal,
            });

            const data = (await response.json())?.data[0];

            if (!data) return undefined;

            if (response.ok) {
                const channel = new Channel(this.client, data);

                this.cache.set(channel.id, channel);

                return channel;
            }

            if (!this.client.options.handleRejections) throw new Error(`unable to fetch channel`);

            return;
        } catch (error) {
            if (!this.client.options.handleRejections)
                if (controller.signal.aborted) {
                    throw new Error(`request to fetch channel was aborted`);
                } else {
                    throw new Error(`failed to fetch channel`);
                }

            return undefined;
        } finally {
            clearTimeout(timeout);
        }
    }
}
