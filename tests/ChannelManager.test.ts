import { expect } from "chai";
import * as Twitch from "../src";
import { TEST_TYPES } from "./shared.test";
import fetch from "node-fetch";

describe(`${TEST_TYPES.CLASS} ChannelManager`, () => {
    const client = new Twitch.Client({
        clientId: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        scope: [],
    });

    before(async () => {
        await client.login();
    });

    it("returns undefined for items not cached", async () => {
        expect(client.channels.cache.get("41245072")).to.be.undefined;
    });

    it("can fetch a channel", async () => {
        const channel = await client.channels.fetch("41245072");

        console.log(fetch)

        expect(channel).to.not.be.undefined;

        expect(channel).to.be.an.instanceOf(Twitch.Channel);
    });

    it("returns a channel for cached items", () => {
        expect(client.channels.cache.get("41245072")).to.be.an.instanceOf(Twitch.Channel);
    });
});
