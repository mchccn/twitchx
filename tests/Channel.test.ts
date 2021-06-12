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
});
