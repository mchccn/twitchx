import ws from "ws";

export default class PubSub {
    private readonly client = new ws("wss://pubsub-edge.twitch.tv", {});

    constructor() {}
}
