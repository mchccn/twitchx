import Collection from "@discordjs/collection";
import fetch from "node-fetch";
import { Channel, ChannelEmote, ChannelEmoteData, Client } from "../..";
import { Base } from "../../base";
import { BASE_URL, HTTPError, InternalError, TwitchAPIError } from "../../shared";

export type SetEmoteData = ChannelEmoteData & { owner_id: string };

/**
 * A set of channel emotes.
 * @class
 * @extends {Base}
 */
export default class ChannelEmoteSet extends Base {
    public readonly client;

    public readonly emotes;
    public readonly channelID: string;
    public readonly id: string;

    /**
     * Creates a new channel emote set.
     * @param {Client} client Client that instantiated this set.
     * @param {SetEmoteData[]} data Data for the emote set.
     * @param {Channel} channel Channel the set is in.
     * @constructor
     */
    public constructor(client: Client, private data: SetEmoteData[], public channel: Channel) {
        super(client);

        /**
         * Parent channel's ID.
         * @type {string}
         * @readonly
         */
        this.channelID = this.data[0].owner_id;

        /**
         * Emote set's ID.
         * @type {string}
         * @readonly
         */
        this.id = this.data[0].emote_set_id;

        data.forEach((e) => {
            const emote = new ChannelEmote(this.client, e, this.channel.id);

            this.emotes.set(e.id, emote);
        });

        /**
         * The set of emotes in this set.
         * @type {Collection<string, ChannelEmote>}
         * @readonly
         */
        this.emotes = new Collection<string, ChannelEmote>();

        /**
         * Client that instantiated this set.
         * @type {Client}
         * @readonly
         */
        this.client = client;

        this.client.emit("channelEmoteSetCreate", this);
    }

    /**
     * Updates this instance with new data from the API.
     * @returns {Promise<boolean>} True if the update was successful.
     */
    public async update() {
        if (!this.client.token) throw new InternalError("Token not available");

        const response = await fetch(`${BASE_URL}/chat/emotes/set?emote_set_id=${this.id}`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data: SetEmoteData[] | undefined = (await response.json())?.data;

            if (!data) {
                if (!this.client.options.suppressRejections)
                    throw new TwitchAPIError("Emote set was fetched but no data was returned");

                return false;
            }

            this.data = data;

            return true;
        }

        if (!this.client.options.suppressRejections) throw new TwitchAPIError("Unable to fetch emote set");

        return false;
    }
}

/**
 * @typedef {ChannelEmoteData} SetEmoteData
 * @prop {string} owner_id
 */
