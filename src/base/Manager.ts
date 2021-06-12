import Collection from "@discordjs/collection";
import { Awaited } from "../types/utils";
import Client from "./Client";

export default abstract class Manager<V> {
    public readonly cache = new Collection<string, V>();

    constructor(public readonly client: Client) {}

    abstract get(id: string): V | undefined;

    abstract fetch(id: string): Awaited<V | undefined>;
}
