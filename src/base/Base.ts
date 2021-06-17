import type Client from "./Client";

/**
 * Base class for any entity returned by the Twitch API.
 * @abstract
 * @class
 */
export default abstract class Base {
    public readonly client: Client;

    /**
     * Constructs a new base prototype.
     * @param {Client} client Client that instantiated this entity.
     */
    constructor(client: Client) {
        /**
         * Client that instantiated this entity.
         * @type {Client}
         * @readonly
         */
        this.client = client;
    }
}
