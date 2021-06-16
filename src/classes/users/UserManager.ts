import Collection from "@discordjs/collection";
import AbortController from "abort-controller";
import fetch from "node-fetch";
import type { Client } from "../../base";
import { Manager } from "../../base/internal";
import { BASE_URL, MILLISECONDS } from "../../shared";
import type { SinglePartial, UserData } from "../../types";
import User from "./User";

/**
 * Manages the client's users.
 * @class
 * @extends {Manager}
 */
export default class UserManager extends Manager<User> {
    public readonly client;

    /**
     * Constructs a new user manager.
     * @param client The client that insantiated this manager.
     * @constructor
     */
    constructor(client: Client) {
        super(client, {
            update:
                typeof client.options.update.users === "boolean"
                    ? client.options.update.users
                        ? MILLISECONDS.DAY
                        : MILLISECONDS.NEVER
                    : client.options.update.users ?? MILLISECONDS.DAY,
            ttl:
                typeof client.options.ttl.users === "boolean"
                    ? client.options.ttl.users
                        ? MILLISECONDS.WEEK
                        : MILLISECONDS.NEVER
                    : client.options.ttl.users ?? MILLISECONDS.WEEK,
        });

        /**
         * The client that insantiated this manager.
         * @type {Client}
         * @readonly
         */
        this.client = client;
    }

    /**
     * Fetch for users from the API with ID or logins.
     * @param {object} query Query for users on Twitch.
     * @param {UserFetchOptions | undefined} options Fetch options.
     * @returns {Promise<User | undefined>} The user fetched.
     */
    public async fetch(
        query: SinglePartial<{
            ids: string[];
            logins: string[];
        }>,
        options?: { force?: boolean }
    ): Promise<Collection<string, User>>;
    /**
     * Fetch for user from the API with an ID.
     * @param {string} query Query for users on Twitch.
     * @param {UserFetchOptions | undefined} options Fetch options.
     * @returns {Promise<User | undefined>} The user fetched.
     */
    public async fetch(query: string, options?: { type?: "id" | "login"; force?: boolean }): Promise<User | undefined>;
    /**
     * Fetch for users from the API with IDs or logins.
     * @param {string | object} query Query for users on Twitch.
     * @param {UserFetchOptions | undefined} options Fetch options.
     * @returns {Promise<User | undefined> | Promise<Collection<string, user>>} The fetched users.
     */
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
            if (this.cache.has(query) && !options?.force) return this.cache.get(query);

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

                if (!this.client.options.suppressRejections) throw new Error("unable to fetch user");

                return undefined;
            } catch (error) {
                if (!this.client.options.suppressRejections)
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

            if (!this.client.options.suppressRejections) throw new Error("unable to fetch users");

            return undefined;
        } catch (error) {
            if (!this.client.options.suppressRejections)
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

/**
 * @typedef {object} UserFetchOptions
 * @prop {string | undefined} type Either "id" or "login".
 * @prop {string | undefined} force Skip cache check and request directly from the API.
 */
