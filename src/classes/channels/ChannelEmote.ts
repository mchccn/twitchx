import fetch from "node-fetch";
import { Client } from "../..";
import { BASE_URL } from "../../shared/constants";
import { InternalError, TwitchAPIError } from "../../shared/errors";
import { ChannelEmoteData } from "../../types/classes/channelEmote";
import Emote from "../emotes/Emote";

export default class ChannelEmote extends Emote {
    public constructor(public readonly client: Client, data: ChannelEmoteData, private broadcasterID: string) {
        super(client, data);
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

    public get tier() {
        return (this.data as ChannelEmoteData).tier;
    }

    public get type() {
        return (this.data as ChannelEmoteData).emote_type;
    }

    public get setID() {
        return (this.data as ChannelEmoteData).emote_set_id;
    }

    public async update() {
        if (!this.client.token) throw new InternalError("Token not available");

        const res = await fetch(`${BASE_URL}/chat/emotes?broadcaster_id=${this.broadcasterID}`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        });

        if (res.ok) {
            const current: ChannelEmoteData = (await res.json()).data.find((e: ChannelEmoteData) => e.id === this.id);
            this.data = current;
        }

        if (!this.client.options.handleRejections) throw new TwitchAPIError("unable to udpate emote");

        return;
    }
}
