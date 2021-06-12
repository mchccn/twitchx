import { expect } from "chai";
import "dotenv/config";
import * as Twitch from "../src";
import { TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.CLASS} Channel`, () => {
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
    });

    let channel: Twitch.Channel;

    it("has a client instance", () => {
        expect(channel.client).to.not.be.undefined;
    });

    it("has emotes", async () => {
        const emotes = await channel.fetchEmotes();
        console.log(emotes);

        expect(emotes).to.not.be.undefined;
    });

    it("has properties given by its data", () => {
        expect(channel.gameId).to.be.a.string("");

        expect(channel.gameName).to.be.a.string("");

        expect(channel.id).to.be.a.string("41245072");

        expect(channel.language).to.be.a.string("");

        expect(channel.name).to.be.a.string("");

        expect(channel.title).to.be.a.string("");

        expect(channel.delay).to.equal(0);
    });

    it("can fetch and update itself", async () => {
        await channel.update();
    });
});
