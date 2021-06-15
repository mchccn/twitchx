import fetch from "node-fetch";
import { Client, Manager } from "../../base/internal";
import { BASE_URL, HTTPError, InternalError, MILLISECONDS, TwitchAPIError } from "../../shared";
import { Channel } from "../internal";
import type { SetEmoteData } from "./ChannelEmoteSet";
import ChannelEmoteSet from "./ChannelEmoteSet";

/**
 * Manages emote sets in a channel.
 * @class
 * @extends {Manager<ChannelEmoteSet>}
 */
export default class ChannelEmoteSetManager extends Manager<ChannelEmoteSet> {
    public readonly client;
    public readonly channel;

    /**
     * Creates a new channel emote set manager.
     * @param {Client} client Client that instantiated this manager.
     * @param {Channel} channel Channel this manager belongs to.
     */
    public constructor(client: Client, channel: Channel) {
        super(client, {
            update:
                typeof client.options.update.channelEmotes === "boolean"
                    ? client.options.update.channelEmotes
                        ? client.emotes.options.update
                        : MILLISECONDS.NEVER
                    : client.options.update.channelEmotes ?? client.emotes.options.ttl,
            ttl:
                typeof client.options.ttl.channelEmotes === "boolean"
                    ? client.options.ttl.channelEmotes
                        ? client.emotes.options.ttl
                        : MILLISECONDS.NEVER
                    : client.options.ttl.channelEmotes ?? client.emotes.options.ttl,
        });

        /**
         * Channel this manager belongs to.
         * @type {Channel}
         * @readonly
         */
        this.channel = channel;

        /**
         * Client that instantiated this manager.
         * @type {Client}
         * @readonly
         */
        this.client = client;
    }

    /**
     * Fetches an emote set from the API.
     * @param {string} id ID of the emote set to fetch.
     * @returns {Promise<ChannelEmoteSet>} The fetched emote set.
     */
    public async fetch(id: string) {
        if (!this.client.token) throw new InternalError("Token not available");

        const response = await fetch(`${BASE_URL}/chat/emotes/set?id=${id}`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data: SetEmoteData[] = (await response.json())?.data;

            if (!data) {
                if (!this.client.options.suppressRejections)
                    throw new TwitchAPIError("Emote set fetched but no data was returned");

                return;
            }

            const set = new ChannelEmoteSet(this.client, data, this.channel);

            this.cache.set(id, set);

            return set;
        }

        if (!this.client.options.suppressRejections) throw new TwitchAPIError("Unable to fetch emote set");

        return;
    }
}
