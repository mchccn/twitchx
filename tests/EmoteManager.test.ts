import Collection from "@discordjs/collection";
import { expect } from "chai";
import * as Twitch from "../src";
import { TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.CLASS} EmoteManager`, () => {
    const client = new Twitch.Client({
        clientId: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        scope: [],
    });

    before(async () => {
        await client.login();

        manager = client.emotes;
    });

    let manager: Twitch.EmoteManager;

    it("returns undefined for items not cached", () => {
        expect(manager.cache.get("301294107")).to.be.undefined;
    });

    it("can fetch an emote", async () => {
        const emote = await manager.fetch("196892");

        expect(emote).to.not.be.undefined;

        expect(emote).to.be.an.instanceOf(Twitch.Emote);
    });

    it("can fetch all global emotes", async () => {
        const emotes = await manager.fetch();

        expect(emotes).to.not.be.undefined;

        expect(emotes).to.be.an.instanceOf(Collection);

        expect(emotes.size).to.be.greaterThan(0);

        expect(emotes.first()).to.be.an.instanceOf(Twitch.Emote);
    });

    it("returns an emote for cached items", () => {
        const emote = manager.cache.get("196892");

        expect(emote).to.not.be.undefined;

        expect(emote).to.be.an.instanceOf(Twitch.Emote);
    });
});
