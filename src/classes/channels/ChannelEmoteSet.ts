import Collection from "@discordjs/collection";
import { Channel, ChannelEmoteData, Client, ChannelEmote } from "../..";

export type SetEmoteData = ChannelEmoteData & { owner_id: string };

export default class ChannelEmoteSet {
    public readonly emotes = new Collection<string, ChannelEmote>();
    public readonly channelID: string;

    public constructor(public readonly client: Client, private data: SetEmoteData[], public channel: Channel) {
        this.channelID = data[0].owner_id;

        data.forEach((e) => {
            const emote = new ChannelEmote(this.client, e, this.channel.id);

            this.emotes.set(e.id, emote);
        });
    }
}
