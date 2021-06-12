import { expect } from "chai";
import * as Twitch from "../src";
import { TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.CLASS} User`, () => {
    const client = new Twitch.Client({
        clientId: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        scope: [],
    });

    before(async () => {
        await client.login();

        user = new Twitch.User(client, {
            id: "",
            login: "",
            display_name: "",
            type: "",
            broadcaster_type: "",
            description: "",
            profile_image_url: "",
            offline_image_url: "",
            view_count: 0,
            email: "",
            created_at: "",
        });
    });

    let user: Twitch.User;

    it("has a client instance", () => {
        expect(user.client).to.not.be.undefined;
    });
});
