import fetch from "node-fetch";
import { Channel, ChannelEmoteSet, Client, Manager } from "../..";
import { BASE_URL, HTTPError, InternalError, MILLISECONDS, TwitchAPIError } from "../../shared";
import { SetEmoteData } from "./ChannelEmoteSet";

export default class ChannelEmoteSetManager extends Manager<ChannelEmoteSet> {
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

    public async fetch(id: string) {
        if (!this.client.token) throw new InternalError("Token not available");

        const response = await fetch(`${BASE_URL}/chat/emotes/set?id=${id}`, {
            headers: {
                Authorization: `Bearer ${this.client.token}`,
                "Client-Id": this.client.options.clientId,
            },
        }).catch((e) => {
            throw new HTTPError(e);
        });

        if (response.ok) {
            const data: SetEmoteData[] = (await response.json())?.data;

            if (!data) {
                if (!this.client.options.suppressRejections)
                    throw new TwitchAPIError("Emote set fetched but no data was returned");

                return;
            }

            const set = new ChannelEmoteSet(this.client, data, this.channel);

            this.cache.set(id, set);

            return set;
        }

        if (!this.client.options.suppressRejections) throw new TwitchAPIError("Unable to fetch emote set");

        return;
    }
}
