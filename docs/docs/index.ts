import fs from "fs";
import yaml from "js-yaml";
import markdown from "markdown-it";
import { join } from "path";

const md = new markdown();

const config = yaml.load(fs.readFileSync(join(__dirname, "config.yml"), "utf8")) as {
    name: string;
    files: {
        name: string;
        path: string;
    }[];
}[];

const result = config.map(({ name: category, files }) => ({
    name: category,
    pages: files.map(({ name, path }) => ({
        name,
        content: md.render(fs.readFileSync(join(__dirname, category, path), "utf8")),
    })),
}));

fs.writeFileSync(join(__dirname, "..", "src", "docs.json"), JSON.stringify(result));

console.log("Done.");
