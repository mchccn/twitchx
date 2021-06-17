import { Client, Manager } from "../../base";
import { MILLISECONDS } from "../../shared/constants";
import Channel from "./Channel";
import ChannelReward from "./ChannelReward";

class ChannelRewardManager extends Manager<ChannelReward> {
    public readonly client;
    public readonly channel;

    /**
     * Creates a new channel reward manager.
     * @param {Client} client Client that instantiated this manager.
     * @param {string} channelId Parent channel's id.
     */
    public constructor(client: Client, channel: Channel) {
        super(client, {
            update:
                typeof client.options.update.channelRewards === "boolean"
                    ? client.options.update.channelRewards
                        ? MILLISECONDS.HOUR
                        : MILLISECONDS.NEVER
                    : client.options.update.channelRewards ?? MILLISECONDS.HOUR,
            ttl:
                typeof client.options.ttl.channelRewards === "boolean"
                    ? client.options.ttl.channelRewards
                        ? MILLISECONDS.DAY
                        : MILLISECONDS.NEVER
                    : client.options.ttl.channelRewards ?? MILLISECONDS.DAY,
        });

        /**
         * Client that instantiated this manager.
         * @type {Client}
         * @readonly
         */
        this.client = client;

        this.channel = channel;
    }

    /**
     * Fetches a reward.
     * TODO: Implement fetching.
     * @param {string} id ID to fetch.
     * @returns {Promise<ChannelReward | undefined>} The fetched reward, if any.
     */
    public fetch(id: string) {
        return undefined;
    }
}

export default ChannelRewardManager;
