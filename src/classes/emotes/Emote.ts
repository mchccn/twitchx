import fetch from "node-fetch";
import type { Client } from "../../base";
import { Base } from "../../base";
import { HTTPError, InternalError, TwitchAPIError } from "../../shared";
import { BASE_URL } from "../../shared/";
import type { EmoteData } from "../../types";

/**
 * Represents a global emote on Twitch.
 * @class
 * @extends Base
 */
export default class Emote extends Base {
    /**
     * Constructs an Emote from the client and raw data.
     * @param {Client} client The client this emote belongs to
     * @param {EmoteData} data The raw data provided by the api
     * @constructor
     */
    constructor(public readonly client: Client, protected data: EmoteData) {
        super(client);
    }

    /**
     * The emote's ID
     * @type {string}
     */
    public get id() {
        return this.data.id;
    }

    /**
     * The emote's name
     * @type {string}
     */
    public get name() {
        return this.data.name;
    }

    /**
     * The emote's images
     * @type {string[]} [1x, 2x, 4x]
     */
    public get images(): [string, string, string] {
        return [...(Object.values(this.data.images) as [string, string, string])];
    }

    /**
     * Updates this emote's data.
     * @returns {Promise<boolean>} True if the update was succesful.
     */
    public async update() {
        if (!this.client.token) throw new InternalError("Token not available");

        const response = await fetch(`${BASE_URL}/chat/emotes/global`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data = (await response.json()).data.find((e: EmoteData) => e.id === this.id);

            this.data = data;

            return true;
        }

        if (!this.client.options.suppressRejections) throw new TwitchAPIError("unable to update emote");

        return false;
    }
}
