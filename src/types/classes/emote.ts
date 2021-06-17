export interface EmoteData {
    /**
     * Emote's id.
     */
    id: string;
    /**
     * Emote's name.
     */
    name: string;
    /**
     * Emote's images.
     */
    images: {
        /**
         * Emote's 1x image version.
         */
        url_1x: string;
        /**
         * Emote's 2x image version.
         */
        url_2x: string;
        /**
         * Emote's 4x image version.
         */
        url_4x: string;
    };
}

/**
 * @typedef {object} EmoteDataImages
 * @prop {string} url_1x Emote's 1x image version.
 * @prop {string} url_2x Emote's 2x image version.
 * @prop {string} url_4x Emote's 4x image version.
 */

/**
 * @typedef {object} EmoteData
 * @prop {string} id Emote's id.
 * @prop {string} name Emote's name.
 * @prop {EmoteDataImages} images Emote's images.
 */
