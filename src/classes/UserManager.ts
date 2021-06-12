import fetch from "node-fetch";
import { Client } from "../base";
import Manager from "../base/Manager";
import { BASE_URL } from "../shared/constants";
import { HTTPError, TwitchAPIError } from "../shared/errors";
import User from "./User";

export default class UserManager extends Manager<User> {
    constructor(public readonly client: Client) {
        super(client);
    }

    public get(id: string) {
        return this.cache.get(id);
    }

    public clear() {
        return this.cache.clear();
    }

    public has(id: string) {
        return this.cache.has(id);
    }

    public keys() {
        return this.cache.keys();
    }

    public values() {
        return this.cache.values();
    }

    public entries() {
        return this.cache.entries();
    }

    public get size() {
        return this.cache.size;
    }

    public async fetch(id: string, force?: boolean) {
        if (this.has(id) && !force) return this.get(id);

        const res = await fetch(`${BASE_URL}/users?id=${encodeURIComponent(id)}`, {
            headers: {
                Authorization: `OAuth ${this.client.token}`,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (res.ok) return new User(this.client, await res.json());

        if (!this.client.options.handleRejections) throw new TwitchAPIError("Unable to fetch user");

        return;
    }
}
