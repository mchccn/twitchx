import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { Base } from "../../base";
import type Client from "../../base/Client";
import { ExternalError, HTTPError, snakeCasify, TwitchAPIError } from "../../shared";
import { BASE_URL } from "../../shared/";
import type { UserData } from "../../types/classes";

/**
 * Represents a user on twitch.
 *
 * @class
 * @extends Base
 */
export default class User extends Base {
    /**
     * Creates a user from the given client and
     * @param client The Client instance that this user belongs to
     * @param data The raw data provided by the Twitch API
     *
     * @constructor
     */
    public constructor(public readonly client: Client, private data: UserData) {
        super(client);

        this.client.emit("userCreate", this);
    }

    /**
     * The user's ID.
     * @type {string}
     */
    public get id() {
        return this.data.id;
    }

    /**
     * The user's login name (username but all lowercase).
     * @type {string}
     */
    public get login() {
        return this.data.login;
    }

    /**
     * The user's display name.
     * @type {string}
     */
    public get displayName() {
        return this.data.display_name;
    }

    /**
     * The user's type (staff status).
     * @type {string}
     */
    public get type() {
        return this.data.type;
    }

    /**
     * The user's broadcaster type (partner program).
     * @type {string}
     */
    public get broadcasterType() {
        return this.data.broadcaster_type;
    }

    /**
     * Total number of views on this user's channel.
     * @type {number}
     */
    public get viewCount() {
        return this.data.view_count;
    }

    /**
     * Returns the email of the user (scope `user:read:email` is required).
     * @type {string|undefined}
     */
    public get email() {
        return this.data.email;
    }

    /**
     * The user's description.
     * @type {string}
     */
    public get description() {
        return this.data.description;
    }
    
    protected set description(des) {
        this.description = des;
    }

    /**
     * The Date when the user was created.
     * @type {Date}
     */
    public get createdAt() {
        return new Date(this.data.created_at);
    }

    /**
     * The timestamp of the user being created.
     * Identical to calling `getTime()` on `createdAt`.
     * @type {number}
     */
    public get createdTimestamp() {
        return new Date(this.data.created_at).getTime();
    }

    /**
     * @typedef {object} AvatarURLOptions
     * @prop {boolean} offline fetch offline avatar?
     */

    /**
     * Returns the user's avatar URL.
     * If `options.offline` is true, the offline avatar will be returned.
     * @param {AvatarURLOptions} options options for the avatar URL
     * @returns {string} the user's avatar URL
     */
    public avatarURL(options?: { offline?: boolean }): string {
        return options?.offline ? this.data.offline_image_url : this.data.profile_image_url;
    }

    /**
     * Updates this user object to hold the newest data.
     * @returns a promise that should resolve to undefined on success
     */
    public async update() {
        if (!this.client.options.update.channels) {
            if (!this.client.options.suppressRejections)
                throw new Error(`updating users was disabled but was still attempted`);

            return;
        }

        if (!this.client.token) throw new Error("token is not available");

        const response = await fetch(`${BASE_URL}/users?id=${this.id}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data = (await response.json())?.data[0];

            if (!data) {
                if (!this.client.options.suppressRejections)
                    throw new TwitchAPIError(`user was fetched but no data was returned`);

                return;
            }

            this.data = data;

            return;
        }

        if (!this.client.options.suppressRejections) throw new Error("unable to update user");

        return;
    }

    /**
     * Blocks the user. Requires `user:manage:blocked_users` scope on the client.
     * @param options the options for blocking the user
     * @returns A promise that resolves to a boolean, representing the success of the operation
     */
    public async block(options?: { reason?: "chat" | "whisper"; sourceContext?: "spam" | "harassment" | "other" }) {
        if (!this.client.scope.includes("user:manage:blocked_users"))
            throw new ExternalError(`scope 'user:manage:blocked_users' is required to block users`);

        const { reason, sourceContext } = options ?? {};

        const response = await fetch(
            `${BASE_URL}/users/blocks?${new URLSearchParams(
                snakeCasify({
                    targetUserId: this.id,
                    reason,
                    sourceContext,
                })
            ).toString()}`,
            {
                headers: {
                    authorization: `Bearer ${this.client.token}`,
                    "client-id": this.client.options.clientId,
                },
                method: "PUT",
            }
        ).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) return true;

        if (!this.client.options.suppressRejections) throw new TwitchAPIError(`unable to block user`);

        return false;
    }

    /**
     * Unblocks the given user. Requires `user:manage:blocked_users` scope on the client.
     * @returns {Promise<boolean>} a promise that is resolved to a boolean representing the success of the operation
     */
    public async unblock(): Promise<boolean> {
        if (!this.client.scope.includes("user:manage:blocked_users"))
            throw new ExternalError(`scope 'user:manage:blocked_users' is required to unblock users`);

        const response = await fetch(`${BASE_URL}/users/blocks?target_user_id=${this.id}`, {
            method: "DELETE",
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) return true;

        if (!this.client.options.suppressRejections) throw new TwitchAPIError(`unable to unblock user`);

        return false;
    }

    /**
     * @typedef {object} BlockFetchOptions
     * @prop {number} first
     * @prop {string} after
     */

    /**
     * Returns an array of users that were blocked by this user
     * @param {BlockFetchOptions} param0 pagination options
     * @returns {Promise<User[]>} an array of users that this user has blocked
     */
    public async fetchBlocks({ first, after }: { first: number; after: string }): Promise<User[]> {
        const res = await fetch(
            `${BASE_URL}/users/blocks?${new URLSearchParams(
                snakeCasify({ broadcaster_id: this.id, after, first }).toString()
            )}`,
            {
                headers: {
                    authorization: `Bearer ${this.client.token}`,
                    "client-id": this.client.options.clientId,
                },
                method: "delete",
            }
        ).catch((e) => {
            throw new HTTPError(e);
        });

        if (!res.ok) throw new HTTPError(res.statusText);

        const { data }: { data: any[] } = await res.json();

        let users: User[] = [];

        data.forEach((u) => {
            let usr = new User(this.client, u);
            users.push(usr);
            this.client.users.cache.set(usr.id, usr);
        });

        return users;
    }
}
