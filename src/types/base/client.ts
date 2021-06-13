import type { ChannelEmote, User } from "../../classes";
import type Channel from "../../classes/channels/Channel";

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
    | "user:edit:broadcast"
    | "user:manage:blocked_users"
    | "user:read:email"
    | "user:read:blocked_users"
    | "user:read:broadcast"
    | "user:read:follows"
    | "user:read:subscriptions"
    | "whispers:read"
    | "whispers:edit";

export interface ClientOptions {
    clientId: string;
    clientSecret: string;
    redirectUri?: string;
    forceVerify?: boolean;
    state?: string;
    scope?: ClientScope[];
    update?: {
        users?: boolean | number;
        channels?: boolean | number;
        emotes?: boolean | number;
        channelEmotes?: boolean | number;
    };
    ttl?: {
        users?: number;
        channels?: number;
        emotes?: number;
        channelEmotes?: number;
    };
    debug?: boolean;
    suppressRejections?: boolean;
}

export interface ClientEvents {
    ready: [];
    debug: [string];
    destroy: [];
    channelCreate: [Channel];
    userCreate: [User];
    channelEmoteCreate: [ChannelEmote];
}
