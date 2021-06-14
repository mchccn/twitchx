import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { Base } from "../../base";
import type Client from "../../base/Client";
import { ExternalError, HTTPError, snakeCasify, TwitchAPIError } from "../../shared";
import { BASE_URL } from "../../shared/";
import type { UserData } from "../../types/classes";

export default class User extends Base {
    public constructor(public readonly client: Client, private data: UserData) {
        super(client);

        this.client.emit("userCreate", this);
    }

    public get id() {
        return this.data.id;
    }

    public get login() {
        return this.data.login;
    }

    public get displayName() {
        return this.data.display_name;
    }

    public get type() {
        return this.data.type;
    }

    public get broadcasterType() {
        return this.data.broadcaster_type;
    }

    public get viewCount() {
        return this.data.view_count;
    }

    /**
     * Returns the email of the user (scope `user:read:email` is required).
     */
    public get email() {
        return this.data.email;
    }

    public get description() {
        return this.data.description;
    }

    public get createdAt() {
        return new Date(this.data.created_at);
    }

    public get createdTimestamp() {
        return new Date(this.data.created_at).getTime();
    }

    public avatarURL(options?: { offline?: boolean }) {
        return options?.offline ? this.data.offline_image_url : this.data.profile_image_url;
    }

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

    public async unblock() {
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

    public async fetchBlocks({ first, after }: { first: number, after: string }) {

         const res = await fetch(`${BASE_URL}/users/blocks?${new URLSearchParams(snakeCasify({ broadcaster_id: this.id, after, first }).toString())}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            }, method: 'delete'
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (!res.ok) throw new HTTPError(res.statusText);

        const { data }: { data: any[] } = await res.json();
        
        let users: User[] = [];

        data.forEach(u => {
            let usr = new User(this.client, u);
            users.push(usr)
            this.client.users.cache.set(usr.id, usr);
        })

        return users;
    }
}
