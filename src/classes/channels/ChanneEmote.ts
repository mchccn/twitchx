import { Client } from "../..";
import { ChannelEmoteData } from "../../types/classes/channelEmote";

export default class ChannelEmote {
    public constructor(public readonly client: Client, private data: ChannelEmoteData) {}

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
        return this.data.tier;
    }

    public get type() {
        return this.data.emote_type;
    }

    public get setID() {
        return this.data.emote_set_id;
    }
}
