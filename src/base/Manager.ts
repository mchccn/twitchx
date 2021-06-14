import type { Awaited } from "../types";
import Base from "./Base";
import Cache from "./Cache";
import type Client from "./Client";

/**
 * Manager superclass with a cache and method to fetch entities.
 * @abstract
 * @class
 * @extends {Base}
 */
export default abstract class Manager<V extends { update(): Awaited<unknown> }> extends Base {
    public readonly client;

    public readonly cache;

    public readonly options;

    /**
     * Creates a new manager.
     * @param client Client that instantiated this manager.
     * @param options Options for the cache.
     * @constructor
     */
    public constructor(
        client: Client,
        options: {
            update: number;
            ttl: number;
        }
    ) {
        super(client);

        /**
         * Client that instantiated this manager.
         * @type {Client}
         */
        this.client = client;

        /**
         * Options given for the cache.
         * @type {CacheOptions}
         */
        this.options = options;

        /**
         * Data cached by the manager.
         * @type {Cache}
         */
        this.cache = new Cache<V>(options);
    }

    /**
     * Fetches an entity.
     * @param id Id to fetch.
     * @abstract
     */
    abstract fetch(id: string): Awaited<V | undefined>;
}
