![Banner](./assets/twitchx.png)

<div align="center">
    <h1>twitchx</h1>
    <p style="margin: 0.5rem 0;">Super-powered TypeScript Twitch REST API wrapper.</p>
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/fuck-it-ship-it.svg" />
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/made-with-typescript.svg" />
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/powered-by-black-magic.svg" />
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/60-percent-of-the-time-works-every-time.svg" />
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/fixed-bugs.svg" />
</div>

# About

> **twitchx** is a versatile [Node.js](http://nodejs.org/) library that lets you use the Twitch API with little overhead.
> Written completely in TypeScript with accurate typings, thoroughly maintained and tested to bring you the best developer experience.
> It's versatile, performant, and lightweight, with few depedencies. Zero overhead, full potential.

-   Object-oriented
-   Low overhead
-   Fast
-   API like [discord.js](https://www.npmjs.com/package/discord.js)
-   99.99% coverage
-   Extremely lightweight

# Installation and Usage

**Node.js v14 or newer is required.**

```bash
# Install with NPM:
$ npm install twitchx

# or alternatively, with Yarn:
$ yarn add twitchx
```

```js
// Available with CommonJS:
const Twitch = require("twitchx");

// or with ESM:
import * as Twitch from "twitchx";
```

# Example

```ts
import * as Twitch from "twitchx";

(async () => {
    const client = new Twitch.Client({
        clientId: "a-cool-id",
        clientSecret: "dont-steal-pls",
    });

    await client.login();

    const user = await client.users.fetch("44445592");

    console.log(user);
})();
```

# Links

-   [Website](https://twitchx.js.org/)
-   [Documentation](https://twitchx.js.org/#/docs)
-   [Guide](https://twitchx.js.org/#/docs/guide)
-   [Discord](https://discord.gg/hMzQye6sWU)
-   [GitHub](https://github.com/cursorsdottsx/twitch)
-   [NPM](https://www.npmjs.com/package/twitchx)

# Contributing

Before opening an issue or contributing, make sure that it hasn't been opened or brought up already, or hasn't been done before/is being done.

Read [CONTRIBUTING.md](./CONTRIBUTING.md) for information on contributing.

Submit a PR to the GitHub repo and have a collaborator review the changes.

# Help

If you don't understand something or have trouble creating a feature with **twitchx**, hop in our [Discord](https://discord.gg/hMzQye6sWU) and ask away!

<div style="height: 1rem;"></div>
