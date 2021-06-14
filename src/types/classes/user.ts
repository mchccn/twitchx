export interface UserData {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    email?: string;
    created_at: string;
}

/**
 * @typedef {object} UserData
 * @prop {string} id
 * @prop {string} login
 * @prop {string} display_name
 * @prop {string} type
 * @prop {string} broadcaster_type
 * @prop {string} description
 * @prop {string} profile_image_url
 * @prop {string} offline_image_url
 * @prop {number} view_count
 * @prop {string | undefined} email
 * @prop {string} created_at
 */
