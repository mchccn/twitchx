"use strict";
exports.__esModule = true;
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
