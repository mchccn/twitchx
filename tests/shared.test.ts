import { blue, cyan, greenBright, magenta, red, yellow } from "chalk";
import "dotenv/config";

export const TEST_TYPES = {
    CLASS: blue("class"),
    UTILS: magenta("util"),
    FUNCTION: cyan("function"),
    BEHAVIOUR: greenBright("behavior"),
    ISSUE: yellow("issue"),
    ERROR: red("error"),
} as const;
