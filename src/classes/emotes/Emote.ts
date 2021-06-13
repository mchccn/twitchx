import fetch from "node-fetch";
import type { Client } from "../../base";
import { Base } from "../../base";
import { HTTPError, InternalError, TwitchAPIError } from "../../shared";
import { BASE_URL } from "../../shared/";
import type { EmoteData } from "../../types";

export default class Emote extends Base {
    constructor(public readonly client: Client, protected data: EmoteData) {
        super(client);
    }

    public get id() {
        return this.data.id;
    }

    public get name() {
        return this.data.name;
    }

    public get images(): [string, string, string] {
        return [...(Object.values(this.data.images) as [string, string, string])];
    }

    public async update() {
        if (!this.client.token) throw new InternalError("Token not available");

        const response = await fetch(`${BASE_URL}/chat/emotes/global`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data = (await response.json()).data.find((e: EmoteData) => e.id === this.id);

            this.data = data;

            return;
        }

        if (!this.client.options.suppressRejections) throw new TwitchAPIError("unable to update emote");
    }
}
