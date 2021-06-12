import Collection from "@discordjs/collection";
import AbortController from "abort-controller";
import fetch from "node-fetch";
import { Client } from "../../base";
import Manager from "../../base/Manager";
import { BASE_URL } from "../../shared/constants";
import { UserData } from "../../types";
import { SinglePartial } from "../../types/utils";
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

    public async fetch(
        query: SinglePartial<{
            ids: string[];
            logins: string[];
        }>,
        force?: boolean
    ): Promise<Collection<string, User>>;
    public async fetch(id: string, force?: boolean): Promise<User | undefined>;
    public async fetch(
        query:
            | string
            | SinglePartial<{
                  ids?: string[];
                  logins?: string[];
              }>,
        force?: boolean
    ) {
        if (typeof query === "string") {
            if (this.has(query) && !force) return this.get(query);

            const controller = new AbortController();

            const timeout = setTimeout(() => {
                controller.abort();
            }, 1000);

            try {
                const res = await fetch(`${BASE_URL}/users?id=${encodeURIComponent(query)}`, {
                    headers: {
                        Authorization: `OAuth ${this.client.token}`,
                    },
                    signal: controller.signal,
                });

                const data = (await res.json())?.data[0];

                if (!data) return undefined;

                if (res.ok) return new User(this.client, data);

                if (!this.client.options.handleRejections) throw new Error("unable to fetch user");

                return undefined;
            } catch (error) {
                if (!this.client.options.handleRejections)
                    if (controller.signal.aborted) {
                        throw new Error(`request to fetch user was aborted`);
                    } else {
                        throw new Error(`failed to fetch user`);
                    }

                return undefined;
            } finally {
                clearTimeout(timeout);
            }
        }

        const cached = {
            ids: query.ids ? query.ids.map((id) => this.cache.get(id)) : [],
            logins: query.logins ? query.logins.map((login) => this.cache.find((user) => user.login === login)) : [],
        };

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort();
        }, 1000);

        try {
            const ids = (query.ids ?? [])
                .map((id, i) => (cached.ids[i] && !force ? undefined : `id=${encodeURIComponent(id)}`))
                .filter(($) => typeof $ !== "undefined")
                .join("&");
            const logins = (query.logins ?? [])
                .map((login, i) => (cached.logins[i] && !force ? undefined : `login=${encodeURIComponent(login)}`))
                .filter(($) => typeof $ !== "undefined")
                .join("&");

            const res = await fetch(`${BASE_URL}/users?${ids}${ids && logins ? "&" : ""}${logins}`, {
                headers: {
                    Authorization: `OAuth ${this.client.token}`,
                },
                signal: controller.signal,
            });

            const data: UserData[] = (await res.json())?.data;

            if (!data) return undefined;

            if (res.ok) return new Collection(data.map((data) => [data.id, new User(this.client, data)]));

            if (!this.client.options.handleRejections) throw new Error("unable to fetch users");

            return undefined;
        } catch (error) {
            if (!this.client.options.handleRejections)
                if (controller.signal.aborted) {
                    throw new Error(`request to fetch users was aborted`);
                } else {
                    throw new Error(`failed to fetch users`);
                }

            return undefined;
        } finally {
            clearTimeout(timeout);
        }
    }
}
