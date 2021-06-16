import Collection from "@discordjs/collection";
import fetch from "node-fetch";
import type { Channel, ChannelEmoteData } from "../..";
import type { Client } from "../../base";
import { Manager } from "../../base/internal";
import { BASE_URL, HTTPError, InternalError, MILLISECONDS, TwitchAPIError } from "../../shared/";
import ChannelEmote from "./ChannelEmote";

/**
 * Manages channel emotes.
 * @class
 * @extends {Manager}
 */
export default class ChannelEmoteManager extends Manager<ChannelEmote> {
    public readonly client;

    /**
     * Constructs a new channel emote manager.
     * @param {Client} client Client that instantiated this manager.
     * @param {Channel} channel Channel that instantiated this manager.
     */
    public constructor(client: Client, public readonly channel: Channel) {
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
         * Client that instantiated this manager.
         * @type {Client}
         * @readonly
         */
        this.client = client;
    }

    /**
     * Fetches emotes from the channel.
     * @returns {Promise<Collection<string, ChannelEmote>>}
     */
    public async fetch(): Promise<Collection<string, ChannelEmote>>;
    /**
     * Fetches an emote from the channel.
     * @param {string | undefined} id Optional ID to fetch.
     * @returns {Promise<ChannelEmote | undefined>}
     */
    public async fetch(id: string): Promise<ChannelEmote | undefined>;
    /**
     * Fetches emotes from the channel.
     * @param {string | undefined} id Optional ID to fetch.
     * @returns {Promise<ChannelEmote | undefined> | Promise<Collection<string, ChannelEmote>>}
     */
    public async fetch(id?: string) {
        if (!this.client.token) throw new InternalError("token not available");

        const response = await fetch(`${BASE_URL}/chat/emotes?broadcaster_id=${this.channel.id}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data = await response.json();

            if (!id) {
                const collection = new Collection<string, ChannelEmote>();

                (data.data as ChannelEmoteData[]).forEach((e) => {
                    const emote = new ChannelEmote(this.client, e, this.channel.id);

                    this.cache.set(e.id, emote);
                    collection.set(e.name, emote);
                });

                return collection;
            }

            const current = new ChannelEmote(
                this.client,
                data.data.find((e: ChannelEmoteData) => e.id === id),
                this.channel.id
            );

            return current;
        }

        if (!this.client.options.suppressRejections) throw new TwitchAPIError("Unable to fetch channel emotes");

        return;
    }
}
