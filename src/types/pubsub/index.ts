export type PubSubTopic = string;

export type ClientPubSubEvent = "PING" | "LISTEN" | "UNLISTEN";

export type ServerPubSubEvent = "RECONNECT" | "PONG" | "RESPONSE" | "MESSAGE";

export type ClientPubSubResponse = {
    type: "PING";
};

export type ServerPubSubResponse =
    | {
          type: "PONG";
      }
    | {
          type: "RESPONSE";
          nonce?: string;
          error: "ERR_BADMESSAGE" | "ERR_BADAUTH" | "ERR_SERVER" | "ERR_BADTOPIC" | "";
      }
    | {
          type: "MESSAGE";
          data: {
              topic: PubSubTopic;
              message: string | object;
          };
      };

export interface PubSubOptions {
    suppressRejections?: boolean;
    ws?: import("ws").ClientOptions;
}
