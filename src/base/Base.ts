import type Client from "./Client";

/**
 * Base class for any entity returned by the Twitch API.
 * @abstract
 * @class
 */
export default abstract class Base {
    /**
     * Client that instantiated this entity.
     */
    public readonly client: Client;

    /**
     * Constructs a new base prototype.
     * @param client Client that instantiated this entity.
     */
    constructor(client: Client) {
        this.client = client;
    }
}
