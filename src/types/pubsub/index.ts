export type ClientPubSubEvent = "PING";

export type ServerPubSubEvent = "RECONNECT" | "PONG";

export type ClientPubSubResponse = {
    type: "PING";
};

export type ServerPubSubResponse = {
    type: "PONG";
};
