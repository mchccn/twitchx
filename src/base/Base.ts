import type Client from "./Client";

export default abstract class Base {
    constructor(public readonly client: Client) {}
}
