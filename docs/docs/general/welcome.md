![Banner](../assets/twitchx.png)

<div align="center">
    <h1>twitchx</h1>
    <p style="margin: 0.5rem 0;">Super-powered TypeScript Twitch REST API wrapper.</p>
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/fuck-it-ship-it.svg" />
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/made-with-typescript.svg" />
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/powered-by-black-magic.svg" />
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/60-percent-of-the-time-works-every-time.svg" />
    <img style="display: inline-block; margin: 0.25rem;" src="https://forthebadge.com/images/badges/fixed-bugs.svg" />
</div>

# Welcome

Welcome to the **Twitchx** v1 documentation.

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

# Links

-   [Website](https://cursorsdottsx.github.io/twitchx/#/)
-   [Support Server](https://discord.gg/RygQpd3jBG)

# Example Usage

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
