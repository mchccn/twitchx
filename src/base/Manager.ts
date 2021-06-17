import type { Awaited } from "../types";
import Base from "./Base";
import Cache from "./Cache";
import type Client from "./Client";

/**
 * Manager superclass with a cache and method to fetch entities.
 * @abstract
 * @class
 * @template Value
 */
export default abstract class Manager<Value extends { update(): Awaited<unknown> }> extends Base {
    public readonly cache: Cache<Value>;

    /**
     * Creates a new manager.
     * @param {Client} client Client that instantiated this manager.
     * @param {CacheOptions} options Options for the cache.
     */
    constructor(
        public readonly client: Client,
        public readonly options: {
            update: number;
            ttl: number;
        }
    ) {
        super(client);

        /**
         * Data cached by the manager.
         * @readonly
         * @type {Cache<Value>}
         */
        this.cache = new Cache(options);
    }

    /**
     * Fetches an entity.
     * @param {string} id Id to fetch.
     * @abstract
     */
    abstract fetch(id: string): Awaited<Value | undefined>;
}
