export const BASE_URL = "https://api.twitch.tv/helix";

export const NONCE_CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export const MILLISECONDS = {
    MILLISECOND: 1,
    SECOND: 1000,
    MINUTE: 60000,
    HOUR: 3600000,
    DAY: 86400000,
    WEEK: 604800000,
    MONTH: 2419200000,
    YEAR: 29030400000,
    NEVER: 9007199254740991,
} as const;
