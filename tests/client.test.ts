import { assert } from "chai";
import { client, TEST_TYPES } from "./shared.test";

describe(`${TEST_TYPES.CLASS} Client`, () => {
    it("can log in", async () => {
        await client.login();

        //@ts-ignore
        assert(typeof client.accessToken === "string", "client has an access token");

        //@ts-ignore
        console.log(client.accessToken);
    });

    it("can validate its access token", async () => {
        //@ts-ignore
        await client.validate();
    });

    it("emits debug messages", async () => {
        client.on("debug", console.log);
    });

    it("can get destroyed", async () => {
        await client.destroy();
    });
});
