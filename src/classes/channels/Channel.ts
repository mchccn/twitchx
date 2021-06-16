import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { User } from "..";
import { Base } from "../../base";
import type Client from "../../base/Client";
import { BASE_URL, ExternalError, HTTPError, InternalError, snakeCasify, TwitchAPIError } from "../../shared";
import type { ChannelData } from "../../types/classes";
import ChannelEmoteManager from "./ChannelEmoteManager";
import ChannelEmoteSetManager from "./ChannelEmoteSetManager";
import AbortController from "abort-controller";

/**
 * Twitch API's channel entity represented in a class.
 * @class
 * @extends {Base}
 */
export default class Channel extends Base {
    public readonly client;

    public readonly emotes;

    public readonly emoteSets;
    

    /**
     * Creates a new channel.
     * @param client Client that instantiated this channel.
     * @param data Channel data.
     * @constructor
     */
    public constructor(client: Client, private data: ChannelData) {
        super(client);

        /**
         * Client that instantiated this channel.
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

        this.client.emit("channelCreate", this);
    }

    /**
     * Broadcaster ID of the channel.
     * @type {string}
     */
    public get id() {
        return this.data.broadcaster_id;
    }

    /**
     * Makes a request to the api to get the editors
     */    

    /**
     * Main language of the channel.
     * @type {string}
     */
    public get language() {
        return this.data.broadcaster_language;
    }
    
    /**
     * Name of the channel.
     * @type {string}
     */
    public get name() {
        return this.data.broadcaster_name;
    }

    /**
     * Current game name.
     * @type {string}
     */
    public get gameName() {
        return this.data.game_name;
    }

    /**
     * Current game ID.
     * @type {string}
     */
    public get gameId() {
        return this.data.game_id;
    }

    /**
     * Title of the channel.
     * @type {string}
     */
    public get title() {
        return this.data.title;
    }

    /**
     * Delay of the channel.
     * @type {number}
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

    public async follow(user: User | string): Promise<this> {
        
        if (!this.client.token) throw new InternalError(`token is not available`);
        const id = (user instanceof User ? user.id : user) ?? this.client.user?.id;

        const res = await fetch(`${BASE_URL}/users/follows?${new URLSearchParams(snakeCasify({ from_id: id, to_id: this.id }))}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            }, method: 'post'
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (!res.ok) throw new HTTPError(res.statusText);

        return this;

    }

    public async editors(): Promise<User | undefined> {
    
        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 1000);



        try {

        const response = await fetch(`https://api.twitch.tv/helix/channels/editors?broadcaster_id=${this.data.broadcaster_id}`, {
            headers: {
                authorization: `Bearer ${this.client.token!}`,
                "client-id": this.client.options.clientId,
            },
            signal: controller.signal
        })

        if (response.ok) {
            
            let data = (await response.json())?.data;

            if (!data || !data[0]) return undefined;
            data = data.map(async ({ user_id }: { user_id: string }) => (await this.client.users.fetch(user_id)));
            return data;
        };

        if (!this.client.options.suppressRejections) throw new Error(`unable to fetch all users`);
        return undefined;

    } catch (error) {
        if (!this.client.options.suppressRejections)
            if (controller.signal.aborted) {
                throw new Error(`request to fetch editors was aborted`);
            } else {
            
                throw new Error(`failed to fetch editors`);
            }

        return undefined;
    } finally {
        clearTimeout(timeout);
    }
    }
}
