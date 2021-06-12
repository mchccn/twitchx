import AbortController from "abort-controller";
import fetch from "node-fetch";
import { Client } from "../../base";
import Manager from "../../base/Manager";
import { BASE_URL, MILLISECONDS } from "../../shared/constants";
import Channel from "./Channel";

export default class ChannelManager extends Manager<Channel> {
    constructor(public readonly client: Client) {
        super(client, {
            update:
                typeof client.options.update.channels === "boolean"
                    ? client.options.update.channels
                        ? MILLISECONDS.HOUR
                        : MILLISECONDS.NEVER
                    : client.options.update.channels ?? MILLISECONDS.HOUR,
            ttl:
                typeof client.options.ttl.channels === "boolean"
                    ? client.options.ttl.channels
                        ? MILLISECONDS.DAY
                        : MILLISECONDS.NEVER
                    : client.options.ttl.channels ?? MILLISECONDS.DAY,
        });
    }

    public async fetch(id: string, force?: boolean) {
        if (this.cache.has(id) && !force) return this.cache.get(id);

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

            if (!this.client.options.suppressRejections) throw new Error(`unable to fetch channel`);

            return undefined;
        } catch (error) {
            if (!this.client.options.suppressRejections)
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
