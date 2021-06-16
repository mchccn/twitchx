import AbortController from "abort-controller";
import fetch from "node-fetch";
import type { Client } from "../../base";
import { Manager } from "../../base/internal";
import { BASE_URL, MILLISECONDS } from "../../shared";
import Channel from "./Channel";
import { snakeCasify } from "../../shared/utils"
import type { Awaited } from "../../types/utils"

/**
 * Manages channels.
 * @class
 * @extends {Manager<Channel>}
 */
export default class ChannelManager extends Manager<Channel> {
    public readonly client;

    /**
     * Creates a new channel manager.
     * @param {Client} client Client that instantiated this channel.
     * @constructor
     */
    constructor(client: Client) {
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

        /**
         * Client that instantiated this channel.
         * @type {Client}
         * @readonly
         */
        this.client = client;
    }

    /**
     * Fetches a channel from the Twitch API.
     * @param {string} id  ID to fetch.
     * @param {boolean | undefined} force Skip cache check and request directly from the API.
     */
    public async fetch(id: string, force?: boolean) {
        if (this.cache.has(id) && !force) return this.cache.get(id);

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 1000);

        try {
            const response = await fetch(`${BASE_URL}/channels?broadcaster_id=${id}`, {
                headers: {
                    authorization: `Bearer ${this.client.token!}`,
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

    /**
     * 
     * @param id channel id
     * @param options what to change
     */
    public async modify(
        id: Readonly<string>,
        options: {
            gameId?: string;
            broadcasterLanguage?: string;
            title?: string;
            delay?: number | string;
        }
    ) {
        if (!options || (!options.gameId && !options.broadcasterLanguage && !options.title && !options.delay)) throw new Error("no options were provided");
        
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 1000);

        try {

        const response = await fetch(`${BASE_URL}/channels?broadcaster_id=${id}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
                "Content-Type": 'application/json'
            },
            method: "PATCH",
            signal: controller.signal,
            body: JSON.stringify(snakeCasify(options as {
                gameId?: string;
                broadcasterLanguage?: string;
                title?: string;
                delay?: string;
            }))
        });

        if (!response) return undefined 

        const data = await response.json();

        if (!data) return undefined;
        else return data;

    } catch (error) {
        if (!this.client.options.suppressRejections)
                if (controller.signal.aborted) {
                    throw new Error(`request to modify channel was aborted`);
                } else {
                    throw new Error(`failed to modify the channel`);
                }

            return undefined;
    } finally {
        clearTimeout(timeout);
    }
}
}
