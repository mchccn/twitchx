import fetch from "node-fetch";
import { Base } from "../../base";
import type Client from "../../base/Client";
import { HTTPError, TwitchAPIError } from "../../shared";
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

    public async block(): Promise<boolean> {
        const res = await fetch(`${BASE_URL}/users/blocks?target_user_id=${this.id}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            }, method: 'put'
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (res.ok) return true;
        throw new HTTPError(res.statusText);
    }

    public async unBlock(): Promise<boolean> {
        const res = await fetch(`${BASE_URL}/users/blocks?target_user_id=${this.id}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            }, method: 'delete'
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (res.ok) return true;
        throw new HTTPError(res.statusText);
    }
}
