import Collection from "@discordjs/collection";
import { Client } from "../../base";
import ChannelReward from "./ChannelReward";

class ChannelRewardsManager {
    public readonly cache: Collection<string, ChannelReward>;
    constructor(client: Client) {
        this.cache = new Collection();
    }
}

export default ChannelRewardsManager;
