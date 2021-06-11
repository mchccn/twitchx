import Channel from "../../classes/Channel";

export type ClientScope =
    | "analytics:read:extensions"
    | "analytics:read:games"
    | "bits:read"
    | "channel:edit:commercial"
    | "channel:manage:broadcast"
    | "channel:manage:extensions"
    | "channel:manage:polls"
    | "channel:manage:predictions"
    | "channel:manage:redemptions"
    | "channel:manage:videos"
    | "channel:moderate"
    | "channel:read:editors"
    | "channel:read:hype_train"
    | "channel:read:polls"
    | "channel:read:predictions"
    | "channel:read:redemptions"
    | "channel:read:stream_key"
    | "channel:read:subscriptions"
    | "chat:read"
    | "chat:edit"
    | "clips:edit"
    | "moderation:read"
    | "moderator:manage:automod"
    | "user:edit"
    | "user:edit:follows"
    | "user:manage:blocked_users"
    | "user:read:blocked_users"
    | "user:read:broadcast"
    | "user:read:follows"
    | "user:read:subscriptions"
    | "whispers:read"
    | "whispers:edit";

export interface ClientOptions {
    clientId: string;
    clientSecret: string;
    scope?: ClientScope[];
    update?: {
        channels?: boolean;
    };
    sweep?: {
        channels?: number;
    };
    debug?: boolean;
    handleRejections?: boolean;
}

export interface ClientEvents {
    ready: [];
    debug: [string];
    destroy: [];
    channelCreate: [Channel];
}
