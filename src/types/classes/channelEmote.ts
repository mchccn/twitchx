import { EmoteData } from ".";

export interface ChannelEmoteData extends EmoteData {
    tier: string;
    emote_type: string;
    emote_set_id: string;
}

/**
 * @typedef {object} ChannelEmoteDataImages
 * @prop {string} url_1x
 * @prop {string} url_2x
 * @prop {string} url_4x
 */

/**
 * @typedef {object} ChannelEmoteData
 * @extends {EmoteData}
 * @prop {string} id
 * @prop {string} name
 * @prop {ChannelEmoteDataImages} images
 * @prop {string} tier
 * @prop {string} emote_type
 * @prop {string} emote_set_id
 */
