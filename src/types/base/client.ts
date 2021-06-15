import type { ChannelEmote, ChannelEmoteSet, User } from "../../classes";
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
    channelEmoteSetCreate: [ChannelEmoteSet];
}

/**
 * @typedef {object} ClientUpdateOptions
 * @prop {boolean | number | undefined} users
 * @prop {boolean | number | undefined} channels
 * @prop {boolean | number | undefined} emotes
 * @prop {boolean | number | undefined} channelEmotes
 */

/**
 * @typedef {object} ClientTTLOptions
 * @prop {number | undefined} users
 * @prop {number | undefined} channels
 * @prop {number | undefined} emotes
 * @prop {number | undefined} channelEmotes
 */

/**
 * @typedef {object} ClientOptions
 * @prop {string} clientId
 * @prop {string} clientSecret
 * @prop {string | undefined} redirectUri
 * @prop {string | undefined} forceVerify
 * @prop {string | undefined} state
 * @prop {string[] | undefined} scope
 * @prop {ClientUpdateOptions} update
 * @prop {ClientTTLOptions} ttl
 * @prop {boolean | undefined} debug
 * @prop {boolean | undefined} suppressRejections
 */

/**
 * Emitted when the client has been set up.
 * @event Client#ready
 */

/**
 * Emits general debugging info.
 * @event Client#debug
 * @param {string} info Debugging information emitted.
 */

/**
 * Emitted when the client has been destroyed.
 * @event Client#destroy
 */

/**
 * Emitted when a new Channel instance has been created.
 * @event Client#channelCreate
 * @param {Channel} channel The new channel.
 */

/**
 * Emitted when a new User instance has been created.
 * @event Client#userCreate
 * @param {User} user The new user.
 */

/**
 * Emitted when a new ChannelEmote instance has been created.
 * @event Client#channelEmoteCreate
 * @param {ChannelEmote} emote The new channel emote.
 */

/**
 * Emitted when a new ChannelEmoteSet instance has been created.
 * @event Client#channelEmoteSetCreate
 * @param {ChannelEmoteSet} set The new channel emote set.
 */
