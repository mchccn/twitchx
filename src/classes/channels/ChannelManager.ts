import AbortController from "abort-controller";
import fetch from "node-fetch";
import { Client } from "../../base";
import Manager from "../../base/Manager";
import { BASE_URL } from "../../shared/constants";
import Channel from "./Channel";

export default class ChannelManager extends Manager<Channel> {
    constructor(public readonly client: Client) {
        super(client);
    }

    public get(id: string) {
        return this.cache.get(id);
    }

    public clear() {
        return this.cache.clear();
    }

    public has(id: string) {
        return this.cache.has(id);
    }

    public keys() {
        return this.cache.keys();
    }

    public values() {
        return this.cache.values();
    }

    public entries() {
        return this.cache.entries();
    }

    public get size() {
        return this.cache.size;
    }

    public async fetch(id: string, force?: boolean) {
        if (this.has(id) && !force) return this.get(id);

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 1000);

        try {
            const response = await fetch(`${BASE_URL}/channels`, {
                headers: {
                    authorization: `OAuth ${this.client.token}`,
                },
                signal: controller.signal,
            });

            const data = (await response.json())?.data[0];

            if (!data) return undefined;

            if (response.ok) return new Channel(this.client, data);

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
