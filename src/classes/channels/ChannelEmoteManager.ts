import fetch from "node-fetch";
import { Channel, ChannelEmoteData } from "../..";
import { Client, Manager } from "../../base";
import { BASE_URL, MILLISECONDS } from "../../shared/constants";
import { HTTPError, InternalError, TwitchAPIError } from "../../shared/errors";
import ChannelEmote from "./ChannelEmote";

// FIXME: whatever the error says, idk
export default class ChannelEmoteManager extends Manager<ChannelEmote> {
    public constructor(public readonly client: Client, public readonly channel: Channel) {
        super(client, {
            update: MILLISECONDS.HOUR,
            ttl: MILLISECONDS.DAY,
        });
    }

    public async fetch(): Promise<Map<string, ChannelEmote>>;
    public async fetch(id: string): Promise<ChannelEmote | undefined>;
    public async fetch(id?: string) {
        if (!this.client.token) throw new InternalError("Token not available");

        const emotes = await this.fetchEmotes().catch();

        if (!id) {
            const current = new Map<string, ChannelEmote>();
            emotes?.forEach((e) => current.set(e.name, e));

            return current;
        }

        const current = emotes?.find((e) => e.id === id);

        if (!this.client.options.handleRejections) throw new TwitchAPIError("unable to udpate emote");

        return current;
    }

    private async fetchEmotes(): Promise<ChannelEmote[] | undefined> {
        if (!this.client.token) throw new InternalError("Token not available");

        const res = await fetch(`${BASE_URL}/chat/emotes?broadcaster_id=${this.channel.id}`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (res.ok) {
            const emotes = (await res.json()).data.map(
                (e: ChannelEmoteData) => new ChannelEmote(this.client, e, this.channel.id)
            );
            return emotes;
        }

        if (!this.client.options.handleRejections) throw new TwitchAPIError("Unable to fetch emote");

        return;
    }
}
