import Collection from "@discordjs/collection";
import fetch from "node-fetch";
import type { Channel, ChannelEmoteData } from "../..";
import type { Client } from "../../base";
import { Manager } from "../../base/internal";
import { BASE_URL, HTTPError, InternalError, MILLISECONDS, TwitchAPIError } from "../../shared/";
import ChannelEmote from "./ChannelEmote";

export default class ChannelEmoteManager extends Manager<ChannelEmote> {
    private lastFetched?: number;

    public constructor(public readonly client: Client, public readonly channel: Channel) {
        super(client, {
            update:
                typeof client.options.update.channelEmotes === "boolean"
                    ? client.options.update.channelEmotes
                        ? client.emotes.options.update
                        : MILLISECONDS.NEVER
                    : client.options.update.channelEmotes ?? client.emotes.options.ttl,
            ttl:
                typeof client.options.ttl.channelEmotes === "boolean"
                    ? client.options.ttl.channelEmotes
                        ? client.emotes.options.ttl
                        : MILLISECONDS.NEVER
                    : client.options.ttl.channelEmotes ?? client.emotes.options.ttl,
        });
    }

    public async fetch(): Promise<Collection<string, ChannelEmote>>;
    public async fetch(id: string): Promise<ChannelEmote | undefined>;
    public async fetch(id?: string) {
        if (!this.client.token) throw new InternalError("token not available");

        const emotes = await this.fetchEmotes();

        if (!id) {
            await this.fetchEmotes(true);

            const current = new Collection<string, ChannelEmote>();

            emotes?.forEach((e) => current.set(e.name, e));

            return current;
        }

        const current = emotes?.find((e) => e.id === id);

        return current;
    }

    private async fetchEmotes(force?: boolean) {
        if (typeof this.lastFetched === "undefined" || Date.now() - this.lastFetched > MILLISECONDS.MINUTE || force) {
            if (!this.client.token) throw new InternalError("token not available");

            const response = await fetch(`${BASE_URL}/chat/emotes?broadcaster_id=${this.channel.id}`, {
                headers: {
                    Authorization: `Bearer ${this.client.token}`,
                    "Client-Id": this.client.options.clientId,
                },
            }).catch((e) => {
                throw new HTTPError(e);
            });

            if (response.ok) {
                const emotes = (await response.json()).data.map(
                    (data: ChannelEmoteData) => new ChannelEmote(this.client, data, this.channel.id)
                ) as ChannelEmote[];

                emotes.forEach((emote) => this.cache.set(emote.id, emote));

                this.lastFetched = Date.now();

                return emotes;
            }

            if (!this.client.options.suppressRejections) throw new TwitchAPIError("unable to fetch emote");

            return;
        }

        return;
    }
}
