import "dotenv/config";
import * as Twitch from "../src";
import { client, TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.CLASS} Channel`, () => {
    const channel = new Twitch.Channel(client, {
        broadcaster_id: "41245072",
        broadcaster_language: "",
        broadcaster_name: "",
        delay: 0,
        game_id: "",
        game_name: "",
        title: "",
    });
});
