import { expect } from "chai";
import * as Twitch from "../src";
import { TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.CLASS} User`, () => {
    const client = new Twitch.Client({
        clientId: process.env.CLIENT_ID!,
        clientSecret: process.env.CLIENT_SECRET!,
        scope: [],
    });

    let events = 0;

    before(async () => {
        await client.login();

        client.on("userCreate", () => events++);

        user = new Twitch.User(client, {
            id: "44445592",
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

    it("has properties given by its data", () => {
        expect(user.id).to.be.a.string("44445592");

        expect(user.login).to.be.a.string("");

        expect(user.displayName).to.be.a.string("");

        expect(user.broadcasterType).to.be.a.string("");

        expect(user.description).to.be.a.string("");

        expect(user.avatarURL()).to.be.a.string("");

        expect(user.avatarURL({ offline: true })).to.equal("");

        expect(user.email).to.be.a.string("");

        expect(user.createdAt.getTime()).to.be.NaN;

        expect(user.createdTimestamp).to.be.NaN;
    });

    it("can fetch and update itself", async () => {
        await user.update();

        expect(user.id).to.be.a.string("44445592");

        expect(user.login).to.not.be.undefined;

        expect(user.displayName).to.not.be.undefined;

        expect(user.broadcasterType).to.not.be.undefined;

        expect(user.description).to.not.be.undefined;

        expect(user.avatarURL()).to.not.be.undefined;

        expect(user.avatarURL({ offline: true })).to.not.be.undefined;

        expect(user.email).to.satisfy((email?: string) => typeof email === "undefined" || typeof email === "string");

        expect(user.createdAt.getTime()).to.not.be.undefined;

        expect(user.createdTimestamp).to.not.be.undefined;
    });

    it("triggers the userCreate event once", () => {
        expect(events).to.equal(1);
    });
});
