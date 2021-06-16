import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { isAnyArrayBuffer } from "util/types";
import { Base } from "../../base";
import type Client from "../../base/Client";
import { BASE_URL, ExternalError, HTTPError, InternalError, snakeCasify, TwitchAPIError } from "../../shared";
import type { ChannelData } from "../../types/classes";
import User from "../users/User";
import ChannelEmoteManager from "./ChannelEmoteManager";
import ChannelEmoteSetManager from "./ChannelEmoteSetManager";

export default class Channel extends Base {
    public readonly emotes = new ChannelEmoteManager(this.client, this);

    public readonly emoteSets = new ChannelEmoteSetManager(this.client, this);

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
            if (!this.client.options.suppressRejections)
                throw new ExternalError(`updating channels was disabled but was still attempted`);

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
                if (!this.client.options.suppressRejections)
                    throw new TwitchAPIError(`channel was fetched but no data was returned`);

                return;
            }

            this.data = data;

            return;
        }

        if (!this.client.options.suppressRejections) throw new ExternalError(`unable to update channel`);

        return;
    }

    public async follow(user: User | string): Promise<this> {
        
        if (!this.client.token) throw new InternalError(`token is not available`);
        const id = (user instanceof User ? user.id : user) ?? this.client.user?.id;

        const res = await fetch(`${BASE_URL}/users/follows?${new URLSearchParams(snakeCasify({ from_id: id, to_id: this.id }))}`, {
            headers: {
                authorization: `Bearer ${this.client.token}`,
                "client-id": this.client.options.clientId,
            }, method: 'post'
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (!res.ok) throw new HTTPError(res.statusText);

        return this;
    }
}
