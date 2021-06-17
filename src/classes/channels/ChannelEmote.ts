import fetch from "node-fetch";
import type { Client } from "../..";
import { BASE_URL, InternalError, TwitchAPIError } from "../../shared/";
import type { ChannelEmoteData } from "../../types/classes/";
import Emote from "../emotes/Emote";

/**
 * An emote used in a channel on Twitch.
 * @class
 * @extends {Emote}
 */
export default class ChannelEmote extends Emote {
    public readonly client;

    /**
     * Creates a new channel emote.
     * @param {Client} client Client that instantiated this emote.
     * @param {ChannelEmoteData} data Emote data to consume.
     * @param {string} broadcasterId ID of the broadcaster.
     * @constructor
     */
    public constructor(client: Client, protected data: ChannelEmoteData, private readonly broadcasterId: string) {
        super(client, data);

        /**
         * Client that instantiated this emote.
         * @type {Client}
         * @readonly
         */
        this.client = client;

        this.client.emit("channelEmoteCreate", this);
    }

    /**
     * This emote's ID.
     * @type {string}
     */
    public get id() {
        return this.data.id;
    }

    /**
     * This emote's name.
     * @type {string}
     */
    public get name() {
        return this.data.name;
    }

    /**
     * This emote's image urls.
     * @type {string[]}
     */
    public get images() {
        return [...Object.values(this.data.images)] as [string, string, string];
    }

    /**
     * This emote's tier.
     * @type {string}
     */
    public get tier() {
        return this.data.tier;
    }

    /**
     * This emote's type.
     * @type {string}
     */
    public get type() {
        return this.data.emote_type;
    }

    /**
     * This emote's set's ID.
     * @type {string}
     */
    public get setId() {
        return this.data.emote_set_id;
    }

    /**
     * Updates this emote with newly fetched data from the API.
     * @returns {Promise<boolean>} True if the update was successful.
     */
    public async update() {
        if (!this.client.token) throw new InternalError("Token not available");

        const response = await fetch(`${BASE_URL}/chat/emotes?broadcaster_id=${this.broadcasterId}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            },
        });

        if (response.ok) {
            const data: ChannelEmoteData = (await response.json()).data.find((e: ChannelEmoteData) => e.id === this.id);

            this.data = data;

            return true;
        }

        if (!this.client.options.suppressRejections) throw new TwitchAPIError("unable to update emote");

        return false;
    }
}
