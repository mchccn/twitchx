import Collection from "@discordjs/collection";
import fetch from "node-fetch";
import { Channel, ChannelEmoteData, Client, ChannelEmote } from "../..";
import { InternalError, BASE_URL, HTTPError, TwitchAPIError } from "../../shared";

export type SetEmoteData = ChannelEmoteData & { owner_id: string };

export default class ChannelEmoteSet {
    public readonly emotes = new Collection<string, ChannelEmote>();
    public readonly channelID: string;
    public readonly id: string;

    public constructor(public readonly client: Client, private data: SetEmoteData[], public channel: Channel) {
        this.channelID = this.data[0].owner_id;
        this.id = this.data[0].emote_set_id;

        data.forEach((e) => {
            const emote = new ChannelEmote(this.client, e, this.channel.id);

            this.emotes.set(e.id, emote);
        });
    }

    public async update() {
        if (!this.client.token) throw new InternalError("Token not available");

        const response = await fetch(`${BASE_URL}/chat/emotes/set?emote_set_id=${this.id}`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data: SetEmoteData[] | undefined = (await response.json())?.data;

            if (!data) {
                if (!this.client.options.suppressRejections)
                    throw new TwitchAPIError("Emote set was fetched but no data was returned");

                return;
            }

            this.data = data;
        }

        if (!this.client.options.suppressRejections) throw new TwitchAPIError("Unable to fetch emote set");

        return;
    }
}
