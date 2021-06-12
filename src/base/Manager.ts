import { Awaited } from "../types/utils";
import Base from "./Base";
import Cache from "./Cache";
import Client from "./Client";

export default abstract class Manager<V extends { update(): Awaited<void> }> extends Base {
    public readonly cache: Cache<V>;

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

    abstract fetch(id: string): Awaited<V | undefined>;
}
