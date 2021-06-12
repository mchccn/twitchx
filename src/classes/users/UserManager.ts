import Collection from "@discordjs/collection";
import AbortController from "abort-controller";
import fetch from "node-fetch";
import { Client } from "../../base";
import Manager from "../../base/Manager";
import { BASE_URL, MILLISECONDS } from "../../shared/constants";
import { UserData } from "../../types";
import { SinglePartial } from "../../types/utils";
import User from "./User";

export default class UserManager extends Manager<User> {
    constructor(public readonly client: Client) {
        super(client, {
            update: MILLISECONDS.DAY,
            ttl: MILLISECONDS.WEEK,
        });
    }

    public get(id: string) {
        return this.cache.get(id);
    }

    public async fetch(
        query: SinglePartial<{
            ids: string[];
            logins: string[];
        }>,
        options?: { force?: boolean }
    ): Promise<Collection<string, User>>;
    public async fetch(query: string, options?: { type?: "id" | "login"; force?: boolean }): Promise<User | undefined>;
    public async fetch(
        query:
            | string
            | SinglePartial<{
                  ids?: string[];
                  logins?: string[];
              }>,
        options?: {
            type?: "id" | "login";
            force?: boolean;
        }
    ) {
        if (typeof query === "string") {
            if (this.cache.has(query) && !options?.force) return this.get(query);

            const controller = new AbortController();

            const timeout = setTimeout(() => {
                controller.abort();
            }, 1000);

            try {
                const response = await fetch(
                    `${BASE_URL}/users?${options?.type ?? "id"}=${encodeURIComponent(query)}`,
                    {
                        headers: {
                            authorization: `Bearer ${this.client.token}`,
                            "client-id": this.client.options.clientId,
                        },
                        signal: controller.signal,
                    }
                );

                const data = (await response.json())?.data[0];

                if (!data) return undefined;

                if (response.ok) {
                    const user = new User(this.client, data);

                    this.cache.set(user.id, user);

                    return user;
                }

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
                .map((id, i) => (cached.ids[i] && !options?.force ? undefined : `id=${encodeURIComponent(id)}`))
                .filter(($) => typeof $ !== "undefined")
                .join("&");

            const logins = (query.logins ?? [])
                .map((login, i) =>
                    cached.logins[i] && !options?.force ? undefined : `login=${encodeURIComponent(login)}`
                )
                .filter(($) => typeof $ !== "undefined")
                .join("&");

            const response = await fetch(`${BASE_URL}/users?${ids}${ids && logins ? "&" : ""}${logins}`, {
                headers: {
                    authorization: `Bearer ${this.client.token}`,
                    "client-id": this.client.options.clientId,
                },
                signal: controller.signal,
            });

            const data: UserData[] = (await response.json())?.data;

            if (!data) return undefined;

            if (response.ok) {
                const users = new Collection(data.map((data) => [data.id, new User(this.client, data)]));

                users.forEach((user) => this.cache.set(user.id, user));

                return users;
            }

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
