import { blue, cyan, greenBright, magenta, red, yellow } from "chalk";
import "dotenv/config";
import * as Twitch from "../src";

export const TEST_TYPES = {
    CLASS: blue("class"),
    UTILS: magenta("util"),
    FUNCTION: cyan("function"),
    BEHAVIOUR: greenBright("behavior"),
    ISSUE: yellow("issue"),
    ERROR: red("error"),
} as const;

export const client = new Twitch.Client({
    clientId: process.env.CLIENT_ID!,
    clientSecret: process.env.CLIENT_SECRET!,
    scope: [],
});
