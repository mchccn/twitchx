import { expect } from "chai";
import * as Twitch from "../src";
import { TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.CLASS} ChannelEmote`, () => {
    const client = new Twitch.Client({
        clientId: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        scope: [],
    });

    let events = 0;

    before(async () => {
        await client.login();

        client.on("channelEmoteCreate", () => events++);

        emote = new Twitch.ChannelEmote(
            client,
            {
                id: "301294107",
                emote_set_id: "",
                emote_type: "",
                images: {
                    url_1x: "",
                    url_2x: "",
                    url_4x: "",
                },
                name: "",
                tier: "",
            },
            "41245072"
        );
    });

    let emote: Twitch.ChannelEmote;

    it("has a client instance", () => {
        expect(emote.client).to.not.be.undefined;
    });

    it("has properties given by its data", () => {
        expect(emote.id).to.be.a.string("301294107");

        expect(emote.images).to.be.an.instanceOf(Array);

        expect(emote.images).to.be.of.length(3);

        expect(emote.images[1]).to.be.a.string("");

        expect(emote.name).to.be.a.string("");

        expect(emote.setId).to.be.a.string("");

        expect(emote.tier).to.be.a.string("");

        expect(emote.type).to.be.a.string("");
    });

    it("can fetch and update itself", async () => {
        await emote.update();

        expect(emote.id).to.be.a.string("301294107");

        expect(emote.images).to.not.be.undefined;

        expect(emote.images).to.be.an.instanceOf(Array);

        expect(emote.images).to.be.of.length(3);

        expect(emote.images[2]).to.satisfy((url: string) => typeof url === "string");

        expect(emote.name).to.not.be.undefined;

        expect(emote.setId).to.not.be.undefined;

        expect(emote.tier).to.not.be.undefined;

        expect(emote.type).to.not.be.undefined;
    });

    it("triggers the userCreate event once", () => {
        expect(events).to.equal(1);
    });
});
