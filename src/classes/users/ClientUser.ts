import fetch from "node-fetch";
import { User } from "..";
import { Client } from "../../base";
import { HTTPError } from "../../shared";
import { UserData } from "../../types/classes/user";

class ClientUser extends User {
    constructor(client: Client, data: UserData) {
        super(client, data);
    }

    public async setDescription(description: string) {
        const res = await fetch(`https://api.twitch.tv/helix/users?description=${description}`);

        if (!res.ok) throw new HTTPError(res.statusText);

        const data: UserData = (await res.json()).data[0];

        this.description = data.description;
    }
}

export default ClientUser;
