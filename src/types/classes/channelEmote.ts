export interface ChannelEmoteData {
    id: string;
    name: string;
    images: {
        url_1x: string;
        url_2x: string;
        url_4x: string;
    };
    tier: string;
    emote_type: string;
    emote_set_id: string;
}
