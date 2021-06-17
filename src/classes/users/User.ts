import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { Channel } from "../..";
import { Base } from "../../base";
import type Client from "../../base/Client";
import { ExternalError, HTTPError, InternalError, snakeCasify, TwitchAPIError } from "../../shared";
import { BASE_URL } from "../../shared/";
import type { UserData } from "../../types/classes";

/**
 * Represents a user on Twitch.
 * @class
 * @extends {Base}
 */
export default class User extends Base {
    public readonly client;

    /**
     * Creates a user from the given client and
     * @param {Client} client  Client that instantiated this user.
     * @param {UserData} data The raw data provided by the Twitch API.
     * @constructor
     */
    public constructor(client: Client, protected data: UserData) {
        super(client);

        /**
         * Client that instantiated this user.
         * @type {Client}
         * @readonly
         */
        this.client = client;

        this.client.emit("userCreate", this);
    }

    /**
     * The user's ID.
     * @type {string}
     * @readonly
     */
    public get id() {
        return this.data.id;
    }

    /**
     * The user's login name (username but all lowercase).
     * @type {string}
     * @readonly
     */
    public get login() {
        return this.data.login;
    }

    /**
     * The user's display name.
     * @type {string}
     * @readonly
     */
    public get displayName() {
        return this.data.display_name;
    }

    /**
     * The user's type (staff status).
     * @type {string}
     * @readonly
     */
    public get type() {
        return this.data.type;
    }

    /**
     * The user's broadcaster type (partner program).
     * @type {string}
     * @readonly
     */
    public get broadcasterType() {
        return this.data.broadcaster_type;
    }

    /**
     * Total number of views on this user's channel.
     * @type {number}
     * @readonly
     */
    public get viewCount() {
        return this.data.view_count;
    }

    /**
     * Returns the email of the user (scope `user:read:email` is required).
     * @type {string | undefined}
     * @readonly
     */
    public get email() {
        return this.data.email;
    }

    /**
     * The user's description.
     * @type {string}
     * @readonly
     */
    public get description() {
        return this.data.description;
    }

    protected updateDescription(desc: string) {
        this.data.description = desc;
    }

    /**
     * The Date object when the user was created.
     * @type {Date}
     * @readonly
     */
    public get createdAt() {
        return new Date(this.data.created_at);
    }

    /**
     * The unix timestamp when the user was created.
     * @type {number}
     * @readonly
     */
    public get createdTimestamp() {
        return new Date(this.data.created_at).getTime();
    }

    /**
     * Returns the user's avatar URL.
     * If `options.offline` is true, the offline avatar will be returned.
     * @param {AvatarURLOptions} options Options for the avatar URL.
     * @returns {string} The user's avatar URL.
     */
    public avatarURL(options?: { offline?: boolean }): string {
        return options?.offline ? this.data.offline_image_url : this.data.profile_image_url;
    }

    /**
     * Updates this user object to hold the newest data.
     * @returns {Promise<boolean>} True if the update was successful.
     */
    public async update(): Promise<boolean> {
        if (!this.client.options.update.channels) {
            if (!this.client.options.suppressRejections)
                throw new Error(`updating users was disabled but was still attempted`);

            return false;
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

                return false;
            }

            this.data = data;

            return true;
        }

        if (!this.client.options.suppressRejections) throw new Error("unable to update user");

        return false;
    }

    /**
     * Blocks the user. Requires the `user:manage:blocked_users` scope.
     * @param {BlockOptions | undefined} options User block options.
     * @returns {Promise<boolean>} True if the user was unblocked.
     */
    public async block(options?: {
        reason?: "chat" | "whisper";
        sourceContext?: "spam" | "harassment" | "other";
    }): Promise<boolean> {
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
     * Unblocks the given user. Requires the `user:manage:blocked_users` scope.
     * @returns {Promise<boolean>} True if the user was unblocked.
     */
    public async unblock(user: User | string): Promise<boolean> {
        const id = typeof user === "string" ? user : user.id;

        if (!this.client.scope.includes("user:manage:blocked_users"))
            throw new ExternalError(`scope 'user:manage:blocked_users' is required to unblock users`);

        const response = await fetch(`${BASE_URL}/users/blocks?target_user_id=${id}`, {
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
     * Returns an array of users that are blocked by this user.
     * @param {BlocksFetchOptions | undefined} options Fetch options.
     * @returns {Promise<User[]>} An array of users that are blocked.
     */
    public async fetchBlocks(options?: { first?: number; after?: string }): Promise<User[]> {
        const { first, after } = options ?? {};

        const response = await fetch(
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

        if (!response.ok) throw new HTTPError(response.statusText);

        const { data }: { data: any[] } = await response.json();

        let users: User[] = [];

        data.forEach((u) => {
            let usr = new User(this.client, u);
            users.push(usr);
            this.client.users.cache.set(usr.id, usr);
        });

        return users;
    }

    /**
     * Follows a channel.
     * @param {Channel | string} channel Channel to follow.
     * @returns {Promise<boolean>} True if the follow was successful.
     */
    public async follow(channel: Channel | string) {
        const id = this.id;
        const channelId = channel instanceof Channel ? channel.id : channel;

        if (!this.client.token) throw new InternalError(`token is not available`);

        const response = await fetch(`${BASE_URL}/users/follows?`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
            body: JSON.stringify(
                snakeCasify({
                    fromId: id,
                    toId: channelId,
                })
            ),
            method: "POST",
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (!response.ok) {
            if (!this.client.options.suppressRejections) throw new TwitchAPIError("Unable to follow user");

            return false;
        }

        return true;
    }

    /**
     * Stops following a channel.
     * @param {Channel | string} channel Channel to stop following.
     * @returns {Promise<boolean>} True if the unfollow was successful.
     */
    public async unfollow(channel: Channel | string) {
        const id = this.id;
        const channelId = channel instanceof Channel ? channel.id : channel;

        if (!this.client.token) throw new InternalError(`token is not available`);

        const response = await fetch(
            `${BASE_URL}/users/follows?${new URLSearchParams(snakeCasify({ fromId: id, toId: channelId }))}`,
            {
                headers: {
                    Authorization: `Bearer ${this.client.token}`,
                    "Client-Id": this.client.options.clientId,
                },
                method: "DELETE",
            }
        ).catch((e) => {
            throw new HTTPError(e);
        });

        if (!response.ok) {
            if (!this.client.options.suppressRejections) throw new TwitchAPIError("Unable to unfollow user");

            return false;
        }

        return true;
    }
}

/**
 * Options to retrieve an avatar url.
 * @typedef {object} AvatarURLOptions
 * @prop {boolean | undefined} offline Fetch offline avatar instead.
 */

/**
 * Options for blocking a user.
 * @typedef {object} BlockOptions
 * @prop {string | undefined} reason Reason for the block.
 * @prop {string | undefined} sourceContext Context for the block.
 */

/**
 * Options for fetching blocks.
 * @typedef {object} BlocksFetchOptions
 * @prop {number | undefined} first Offset the first result.
 * @prop {string | undefined} after After this date represented as a string.
 */
