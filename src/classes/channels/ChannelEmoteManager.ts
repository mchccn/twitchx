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

        const response = await fetch(`${BASE_URL}/chat/emotes?broadcaster_id=${this.channel.id}`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data = await response.json();

            if (!id) {
                const collection = new Collection<string, ChannelEmote>();

                (data.data as ChannelEmoteData[]).forEach((e) => {
                    const emote = new ChannelEmote(this.client, e, this.channel.id);

                    this.cache.set(e.id, emote);
                    collection.set(e.name, emote);
                });

                return collection;
            }

            const current = new ChannelEmote(
                this.client,
                data.data.find((e: ChannelEmoteData) => e.id === id),
                this.channel.id
            );

            return current;
        }

        if (!this.client.options.suppressRejections) throw new TwitchAPIError("Unable to fetch channel emotes");

        return;
    }
}
