import { EmoteData } from ".";

export interface ChannelEmoteData extends EmoteData {
    tier: string;
    emote_type: string;
    emote_set_id: string;
}

/**
 * @typedef {object} ChannelEmoteData
 * @extends EmoteData
 * @prop {string} id
 * @prop {string} name
 * @prop {{
 *   url_1x: string,
 *   url_2x: string,
 *   url_4x: string
 * }} images
 * @prop {string} tier
 * @prop {string} emote_type
 * @prop {string} emote_set_id
 */
