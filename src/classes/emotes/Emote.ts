import fetch from "node-fetch";
import { Base, Client } from "../../base";
import { BASE_URL } from "../../shared/constants";
import { HTTPError, InternalError, TwitchAPIError } from "../../shared/errors";
import { EmoteData } from "../../types";

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

        const res = await fetch(`${BASE_URL}/chat/emotes/global`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (res.ok) {
            const current = (await res.json()).data.find((e: EmoteData) => e.id === this.id);
            this.data = current;
        }

        if (!this.client.options.handleRejections) throw new TwitchAPIError("unable to udpate emote");
    }
}
