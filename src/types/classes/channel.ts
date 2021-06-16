export interface ChannelData {
    broadcaster_id: string;
    broadcaster_name: string;
    game_name: string;
    game_id: string;
    broadcaster_language: string;
    title: string;
    delay: number;
    editors?: { user_id: string, user_name: string, created_at: string }[]
}

/**
 * @typedef {object} ChannelData
 * @prop {string} broadcaster_id
 * @prop {string} broadcaster_name
 * @prop {string} game_name
 * @prop {string} game_id
 * @prop {string} broadcaster_language
 * @prop {string} title
 * @prop {number} delay
 * @prop {{ user_id: string, user_name: string, created_at: string }[]?} editors
 */
