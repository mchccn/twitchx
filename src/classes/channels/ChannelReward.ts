import { Base, Client } from "../../base";
import { ChannelRewardData } from "../../types/classes/channelReward";

/**
 * A reward in a channel.
 * @class
 * @extends {Base}
 */
class ChannelReward extends Base {
    public readonly client: Client;

    private readonly data: ChannelRewardData;

    /**
     * Creates a new channel reward entity.
     * @param client Client that instantiated this reward.
     * @param data Data for the reward.
     */
    constructor(client: Client, data: ChannelRewardData) {
        super(client);

        /**
         * Client that instantiated this reward.
         * @type {Client}
         * @readonly
         */
        this.client = client;

        this.data = data;

        this.client.emit("channelRewardCreate", this);
    }

    /**
     * ID of the broadcaster.
     * @type {string}
     * @readonly
     */
    public get broadcasterId() {
        return this.data.broadcaster_id;
    }

    /**
     * Broadcaster's login.
     * @type {string}
     * @readonly
     */
    public get broadcasterLogin() {
        return this.data.broadcaster_login;
    }

    /**
     * Broadcaster's name.
     * @type {string}
     * @readonly
     */
    public get broadcasterName() {
        return this.data.broadcaster_name;
    }

    /**
     * Reward's id.
     * @type {string}
     * @readonly
     */
    public get id() {
        return this.data.id;
    }

    /**
     * Reward's title.
     * @type {string}
     * @readonly
     */
    public get title() {
        return this.data.title;
    }

    /**
     * Reward's prompt.
     * @type {string}
     * @readonly
     */
    public get prompt() {
        return this.data.prompt;
    }

    /**
     * Reward's cost.
     * @type {number}
     * @readonly
     */
    public get cost() {
        return this.data.cost;
    }

    /**
     * Reward's image URL.
     * @type {string}
     * @readonly
     */
    public get image() {
        return this.data.image;
    }

    /**
     * Reward's default image URL.
     * @type {string}
     * @readonly
     */
    public get defaultImage() {
        return this.data.default_image;
    }

    /**
     * Reward's background color.
     * @type {string}
     * @readonly
     */
    public get backgroundColor() {
        return this.data.background_color;
    }

    /**
     * If the reward is enabled.
     * @type {boolean}
     * @readonly
     */
    public get isEnabled() {
        return this.data.is_enabled;
    }

    /**
     * If user input is required.
     * @type {boolean}
     * @readonly
     */
    public get userInputRequired() {
        return this.data.is_user_input_required;
    }

    /**
     * Max reward count per stream.
     * @type {object}
     * @readonly
     */
    public get maxPerStream() {
        return this.data.max_per_stream_setting;
    }

    /**
     * Max reward per user per stream.
     * @type {object}
     * @readonly
     */
    public get maxPerUser() {
        return this.data.max_per_user_per_stream_setting;
    }

    /**
     * Global cooldown.
     * @type {object}
     * @readonly
     */
    public get globalCooldown() {
        return this.data.global_cooldown_setting;
    }

    /**
     * If the reward is paused.
     * @type {boolean}
     * @readonly
     */
    public get isPaused() {
        return this.data.is_paused;
    }

    /**
     * If the reward is in stock.
     * @type {boolean}
     * @readonly
     */
    public get isInStock() {
        return this.data.is_in_stock;
    }

    /**
     * Should redemptions skip the request queue?
     * @type {boolean}
     * @readonly
     */
    public get redemptionsSkipQueue() {
        return this.data.should_redemptions_skip_request_queue;
    }

    /**
     * Redemptions redeemed.
     * @type {number}
     * @readonly
     */
    public get redemptionsRedeemed() {
        return this.data.redemptions_redeemed_current_stream;
    }

    /**
     * When the cooldown expires.
     * @type {string}
     * @readonly
     */
    public get cooldownExpiresAt() {
        return this.data.cooldown_expires_at;
    }

    public async update() {}
}

export default ChannelReward;
