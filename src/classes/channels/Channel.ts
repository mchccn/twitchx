import fetch from "node-fetch";
import { Base } from "../../base";
import type Client from "../../base/Client";
import { BASE_URL, ExternalError, HTTPError, InternalError, TwitchAPIError } from "../../shared";
import type { ChannelData } from "../../types/classes";
import ChannelEmoteManager from "./ChannelEmoteManager";
import ChannelEmoteSetManager from "./ChannelEmoteSetManager";
import ChannelRewardManager from "./ChannelRewardManager";

/**
 * Twitch API's channel entity represented in a class.
 * @class
 * @extends {Base}
 */
export default class Channel extends Base {
    public readonly client;

    public readonly emotes;

    public readonly emoteSets;

    public readonly rewards;

    /**
     * Creates a new channel.
     * @param {Client} client Client that instantiated this channel.
     * @param {ChannelData} data Channel data.
     * @constructor
     */
    public constructor(client: Client, private data: ChannelData) {
        super(client);

        /**
         * Client that instantiated this channel.
         * @type {Client}
         * @readonly
         */
        this.client = client;

        /**
         * Manages this channel's emotes.
         * @type {ChannelEmoteManager}
         * @readonly
         */
        this.emotes = new ChannelEmoteManager(this.client, this);

        /**
         * Manages this channel's emote sets.
         * @type {ChannelEmoteSetManager}
         * @readonly
         */
        this.emoteSets = new ChannelEmoteSetManager(this.client, this);

        /**
         * Manages this channel's rewards.
         * @type {ChannelRewardManager}
         * @readonly
         */
        this.rewards = new ChannelRewardManager(this.client, this);

        this.client.emit("channelCreate", this);
    }

    /**
     * Broadcaster ID of the channel.
     * @type {string}
     * @readonly
     */
    public get id() {
        return this.data.broadcaster_id;
    }

    /**
     * Main language of the channel.
     * @type {string}
     * @readonly
     */
    public get language() {
        return this.data.broadcaster_language;
    }

    /**
     * Name of the channel.
     * @type {string}
     * @readonly
     */
    public get name() {
        return this.data.broadcaster_name;
    }

    /**
     * Current game name.
     * @type {string}
     * @readonly
     */
    public get gameName() {
        return this.data.game_name;
    }

    /**
     * Current game ID.
     * @type {string}
     * @readonly
     */
    public get gameId() {
        return this.data.game_id;
    }

    /**
     * Title of the channel.
     * @type {string}
     * @readonly
     */
    public get title() {
        return this.data.title;
    }

    /**
     * Delay of the channel.
     * @type {number}
     * @readonly
     */
    public get delay() {
        return this.data.delay;
    }

    /**
     * Updates this instance with newly fetched data.
     * @returns {Promise<boolean>} True if the update was successful.
     */
    public async update() {
        if (!this.client.options.update.channels) {
            if (!this.client.options.suppressRejections)
                throw new ExternalError(`updating channels was disabled but was still attempted`);

            return false;
        }

        if (!this.client.token) throw new InternalError(`token is not available`);

        const response = await fetch(`${BASE_URL}/channels?broadcaster_id=${this.id}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data = (await response.json())?.data[0];

            if (!data) {
                if (!this.client.options.suppressRejections)
                    throw new TwitchAPIError(`channel was fetched but no data was returned`);

                return false;
            }

            this.data = data;

            return true;
        }

        if (!this.client.options.suppressRejections) throw new ExternalError(`unable to update channel`);

        return;
    }
}
