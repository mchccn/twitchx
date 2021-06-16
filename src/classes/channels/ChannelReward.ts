import { Client } from "../../base";
import { ChannelRewardData } from "../../types/classes/channelReward";

class ChannelReward {
    private readonly data: ChannelRewardData;
    public readonly client: Client;

    constructor(client: Client, data: ChannelRewardData) {
        this.data = data;
        this.client = client;
    }

    public get broadcasterId() {
        return this.data.broadcaster_id;
    }

    public get broadcasterLogin() {
        return this.data.broadcaster_login;
    }
    
    public get broadcasterName() {
        return this.data.broadcaster_name;
    }

    public get id() {
        return this.data.id;
    }

    public get title() {
        return this.data.title;
    }

    public get prompt() {
        return this.data.prompt;
    }

    public get cost() {
        return this.data.cost;
    }

    public get image() {
        return this.data.image;
    }

    public get defaultImage() {
        return this.data.default_image;
    }

    public get backgroundColor() {
        return this.data.background_color;
    }

    public get isEnabled() {
        return this.data.is_enabled;
    }

    public get isUserInputRequired() {
        return this.data.is_user_input_required;
    }

    public get maxPerStreamSetting() {
        return this.data.max_per_stream_setting;
    }

    public get maxPerUserPerStreamSetting() {
        return this.data.max_per_user_per_stream_setting;
    }

    public get globalCooldownSetting() {
        return this.data.global_cooldown_setting;
    }

    public get isPaused() {
        return this.data.is_paused;
    }

    public get isInStock() {
        return this.data.is_in_stock;
    }

    public get shouldRedemptionsSkipRequestQueue() {
        return this.data.should_redemptions_skip_request_queue;
    }

    public get redemptionsRedeemedCurrentStream() {
        return this.data.redemptions_redeemed_current_stream;
    }

    public get cooldownExpiresAt() {
        return this.data.cooldown_expires_at;
    }
}


export default ChannelReward;
