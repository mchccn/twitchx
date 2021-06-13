export type ClientPubSubEvent = "PING";

export type ServerPubSubEvent = "RECONNECT" | "PONG";

export type ClientPubSubResponse = {
    type: "PING";
};

export type ServerPubSubResponse = {
    type: "PONG";
};

export interface PubSubOptions {
    suppressRejections?: boolean;
    ws?: import("ws").ClientOptions;
}
