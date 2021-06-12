import { expect } from "chai";
import * as Twitch from "../src";
import { TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.CLASS} UserManager`, () => {
    const client = new Twitch.Client({
        clientId: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        scope: [],
    });

    before(async () => {
        await client.login();
    });

    it("returns undefined for items not cached", async () => {
        expect(client.users.cache.get("44445592")).to.be.undefined;
    });

    it("can fetch a channel", async () => {
        const user = await client.users.fetch("44445592");

        expect(user).to.not.be.undefined;

        expect(user).to.be.an.instanceOf(Twitch.User);
    });

    it("returns a channel for cached items", () => {
        expect(client.users.cache.get("44445592")).to.be.an.instanceOf(Twitch.User);
    });
});
