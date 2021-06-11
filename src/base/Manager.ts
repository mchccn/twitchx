import { Awaited } from "../types/utils";
import Client from "./Client";

export default abstract class Manager<V> {
    protected readonly cache = new Map<string, V>();

    constructor(protected client: Client) {}

    abstract get(id: string): V | undefined;

    abstract fetch(id: string): Awaited<V | undefined>;
}
