import type { Awaited } from "../types";
import Base from "./Base";
import Cache from "./Cache";
import type Client from "./Client";

/**
 * Manager superclass with a cache and method to fetch entities.
 * @abstract
 * @class
 */
export default abstract class Manager<V extends { update(): Awaited<unknown> }> extends Base {
    /**
     * Data cached by the manager.
     */
    public readonly cache: Cache<V>;

    /**
     * Creates a new manager.
     * @param client Client that instantiated this manager.
     * @param options Options for the cache,
     */
    constructor(
        public readonly client: Client,
        public readonly options: {
            update: number;
            ttl: number;
        }
    ) {
        super(client);

        this.cache = new Cache(options);
    }

    /**
     * Fetches an entity.
     * @param id Id to fetch.
     * @abstract
     */
    abstract fetch(id: string): Awaited<V | undefined>;
}
