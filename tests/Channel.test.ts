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

    let events = 0;

    before(async () => {
        await client.login();

        client.on("channelCreate", () => events++);

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

    it("can fetch emotes", async () => {
        const emotes = await channel.fetchEmotes();

        expect(emotes).to.not.be.undefined;

        expect(emotes).to.be.an.instanceOf(Array);

        expect(emotes!.length).to.be.greaterThan(0);

        const first = emotes![0];

        expect(first).to.be.an.instanceOf(Twitch.ChannelEmote);

        expect(first.images).to.be.an.instanceOf(Array);

        expect(first.images[2]).to.be.a.string;
    });

    it("has properties given by its data", () => {
        expect(channel.id).to.be.a.string("41245072");

        expect(channel.gameId).to.be.a.string("");

        expect(channel.gameName).to.be.a.string("");

        expect(channel.language).to.be.a.string("");

        expect(channel.name).to.be.a.string("");

        expect(channel.title).to.be.a.string("");

        expect(channel.delay).to.equal(0);
    });

    it("can fetch and update itself", async () => {
        await channel.update();

        expect(channel.id).to.be.a.string("41245072");

        expect(channel.gameId).to.not.be.undefined;

        expect(channel.gameName).to.not.be.undefined;

        expect(channel.language).to.not.be.undefined;

        expect(channel.name).to.not.be.undefined;

        expect(channel.title).to.not.be.undefined;

        expect(channel.delay).to.not.be.undefined;
    });

    it("triggers the channelCreate event once", () => {
        expect(events).to.equal(1);
    });
});
