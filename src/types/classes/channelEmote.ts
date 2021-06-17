import { EmoteData } from ".";

export interface ChannelEmoteData extends EmoteData {
    tier: string;
    emote_type: string;
    emote_set_id: string;
}

/**
 * @typedef {EmoteData} ChannelEmoteData
 * @prop {string} tier
 * @prop {string} emote_type
 * @prop {string} emote_set_id
 */
