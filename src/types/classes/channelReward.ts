export interface ChannelRewardData{
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
    id: string;
    title: string;
    prompt: string;
    cost: number;
    image: object;
    default_image: object;
    background_color: string;
    is_enabled: boolean;
    is_user_input_required: boolean;
    max_per_stream_setting: object;
    max_per_user_per_stream_setting: object;
    global_cooldown_setting: object;
    is_paused: boolean;
    is_in_stock: boolean;
    should_redemptions_skip_request_queue: boolean;
    redemptions_redeemed_current_stream: number;
    cooldown_expires_at: string;
}
