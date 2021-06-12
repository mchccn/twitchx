import fetch from "node-fetch";
import Client from "../base/Client";
import { nullishThrow } from "../shared";
import { BASE_URL } from "../shared/constants";
import { InternalError, TwitchAPIError } from "../shared/errors";
import { ChannelData } from "../types/classes";
import { CHANNEL_MANAGER_CACHE_ACCESS } from "./ChannelManager";

export default class Channel {
    public constructor(private client: Client, private data: ChannelData) {
        this.client.emit("channelCreate", this);

        CHANNEL_MANAGER_CACHE_ACCESS.get(client.channels)?.(this) ??
            nullishThrow(`channel manager unavailable while creating channel`);
    }

    public get id() {
        return this.data.broadcaster_id;
    }

    public get language() {
        return this.data.broadcaster_language;
    }

    public get name() {
        return this.data.broadcaster_name;
    }

    public get gameName() {
        return this.data.game_name;
    }

    public get gameId() {
        return this.data.game_id;
    }

    public get title() {
        return this.data.title;
    }

    public get delay() {
        return this.data.delay;
    }

    public async update() {
        if (!this.client.options.update.channels) {
            if (!this.client.options.handleRejections)
                // FIXME: add proper error type
                throw new Error(`updating channels was disabled but was still attempted`);

            return;
        }

        if (!this.client.token) throw new InternalError(`token is not available`);

        const response = await fetch(`${BASE_URL}/channels`, {
            headers: {
                authorization: `OAuth ${this.client.token}`,
            },
        });

        if (response.ok) return void (this.data = await response.json());

        // FIXME: add proper error type
        if (!this.client.options.handleRejections) throw new Error(`unable to update channel`);

        return;
    }
}
