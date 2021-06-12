import fetch from "node-fetch";
import { Base } from "../../base";
import Client from "../../base/Client";
import { BASE_URL } from "../../shared/constants";
import { HTTPError, InternalError, TwitchAPIError } from "../../shared/errors";
import { ChannelData } from "../../types/classes";

export default class Channel extends Base {
    public constructor(public readonly client: Client, private data: ChannelData) {
        super(client);

        this.client.emit("channelCreate", this);
    }

    public get id() {
        return this.data.broadcaster_id;
    }

    public get language() {
        return this.data.broadcaster_language;
    }

    public get name() {
        return this.data.broadcaster_name;
    }

    public get gameName() {
        return this.data.game_name;
    }

    public get gameId() {
        return this.data.game_id;
    }

    public get title() {
        return this.data.title;
    }

    public get delay() {
        return this.data.delay;
    }

    public async update() {
        if (!this.client.options.update.channels) {
            if (!this.client.options.handleRejections)
                // FIXME: add proper error type
                throw new Error(`updating channels was disabled but was still attempted`);

            return;
        }

        if (!this.client.token) throw new InternalError(`token is not available`);

        const response = await fetch(`${BASE_URL}/channels?broadcaster_id=${this.id}`, {
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
                if (!this.client.options.handleRejections)
                    throw new TwitchAPIError(`channel was fetched but no data was returned`);

                return;
            }

            this.data = data;

            return;
        }

        // FIXME: add proper error type
        if (!this.client.options.handleRejections) throw new Error(`unable to update channel`);

        return;
    }

    public async fetchEmotes() {
        if (!this.client.token) throw new InternalError("token is not available");

        const response = await fetch(`${BASE_URL}/chat/emotes?broadcaster_id=${this.id}`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) return response.json();

        if (!this.client.options.handleRejections) throw new TwitchAPIError("unable to fetch emotes");
    }
}
