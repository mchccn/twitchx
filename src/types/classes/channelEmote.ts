import { EmoteData } from ".";

export interface ChannelEmoteData extends EmoteData {
    tier: string;
    emote_type: string;
    emote_set_id: string;
}
