import { expect } from "chai";
import * as Twitch from "../src";
import { TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.CLASS} ChannelEmoteManager`, () => {
    const client = new Twitch.Client({
        clientId: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        scope: [],
    });

    before(async () => {
        await client.login();

        channel = new Twitch.Channel(client, {
            broadcaster_id: "41245072",
            broadcaster_language: "",
            broadcaster_name: "",
            delay: 0,
            game_id: "",
            game_name: "",
            title: "",
        });

        manager = new Twitch.ChannelEmoteManager(client, channel);
    });

    let channel: Twitch.Channel;

    let manager: Twitch.ChannelEmoteManager;

    it("returns undefined for items not cached", async () => {
        expect(manager.cache.get("301294107")).to.be.undefined;
    });

    it("can fetch an emote", async () => {
        const emote = await manager.fetch("301294107");

        expect(emote).to.not.be.undefined;

        expect(emote).to.be.an.instanceOf(Twitch.ChannelEmote);
    });

    it("returns an emote for cached items", () => {
        expect(manager.cache.get("301294107")).to.be.an.instanceOf(Twitch.ChannelEmote);
    });
});
