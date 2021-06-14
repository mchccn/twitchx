export interface EmoteData {
    id: string;
    name: string;
    images: {
        url_1x: string;
        url_2x: string;
        url_4x: string;
    };
}

/**
 * @typedef {object} EmoteDataImages
 * @prop {string} url_1x
 * @prop {string} url_2x
 * @prop {string} url_4x
 */

/**
 * @typedef {object} EmoteData
 * @prop {string} id
 * @prop {string} name
 * @prop {EmoteDataImages} images
 */
