export interface UserData {
    /**
     * User's id.
     */
    id: string;
    /**
     * User's login.
     */
    login: string;
    /**
     * User's display name.
     */
    display_name: string;
    /**
     * User's type.
     */
    type: "staff" | "admin" | "global_mod" | "";
    /**
     * User's broadcast type.
     */
    broadcaster_type: "partner" | "affiliate" | "";
    /**
     * User's description.
     */
    description: string;
    /**
     * User's profile picture URL.
     */
    profile_image_url: string;
    /**
     * User's offline profile picure URL.
     */
    offline_image_url: string;
    /**
     * User's view count.
     */
    view_count: number;
    /**
     * User's email.
     */
    email?: string;
    /**
     * User's unix timestamp of when they joined Twitch.
     */
    created_at: string;
}

/**
 * @typedef {object} UserData
 * @prop {string} id User's id.
 * @prop {string} login User's login.
 * @prop {string} display_name User's display name.
 * @prop {string} type User's type.
 * @prop {string} broadcaster_type User's broadcast type.
 * @prop {string} description User's description.
 * @prop {string} profile_image_url User's profile picture URL.
 * @prop {string} offline_image_url User's offline profile picure URL.
 * @prop {number} view_count User's view count.
 * @prop {string | undefined} email User's email.
 * @prop {string} created_at User's unix timestamp of when they joined Twitch.
 */
