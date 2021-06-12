import fetch from "node-fetch";
import Client from "../base/Client";
import { nullishThrow } from "../shared";
import { BASE_URL } from "../shared/constants";
import { InternalError } from "../shared/errors";
import { UserData } from "../types/classes";
import { USER_MANAGER_CACHE_ACCESS } from "./UserManager";

export default class User {
    public constructor(private client: Client, private data: UserData) {
        this.client.emit("userCreate", this);

        USER_MANAGER_CACHE_ACCESS.get(client.users)?.(this) ??
            nullishThrow("User manager unavailable when creating user");
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

    public get profileImageURL() {
        return this.data.profile_image_url;
    }

    public get offlineImageURL() {
        return this.data.offline_image_url;
    }

    public get viewCount() {
        return this.data.view_count;
    }

    /**
     * Returns the email of the user.
     * Will be undefined if scope `user:read:email` is not provided.
     */
    public get email() {
        return this.data.email;
    }

    public get createdAt() {
        return new Date(this.data.created_at);
    }

    public get createdTimestamp() {
        return new Date(this.data.created_at).getTime();
    }

    public async update() {
        if (!this.client.options.update.channels) {
            if (!this.client.options.handleRejections)
                // FIXME: add proper error type
                throw new Error("Updating users was disabled but was still attempted");

            return;
        }

        if (!this.client.token) throw new InternalError("Token unavailable");

        const res = await fetch(`${BASE_URL}/users`, {
            headers: {
                Authorization: `OAuth ${this.client.token}`,
            },
        });

        if (res.ok) return void (this.data = await res.json());

        // FIXME: add proper error type
        if (!this.client.options.handleRejections) throw new Error("Unable to update user");

        return;
    }
}
