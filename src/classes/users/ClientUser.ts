import fetch from "node-fetch";
import { User } from "..";
import { Client } from "../../base";
import { HTTPError } from "../../shared";
import { UserData } from "../../types/classes/user";

/**
 * User representing the client on Twitch.
 * @class
 * @extends {User}
 */
class ClientUser extends User {
    public readonly client;

    /**
     * Creates a new user.
     * @param client Client that instantiated this user.
     * @param data User's data.
     */
    constructor(client: Client, data: UserData) {
        super(client, data);

        /**
         * Client that instantiated this user.
         * @type {Client}
         * @readonly
         */
        this.client = client;
    }

    /**
     * Updates the description of this user.
     * @param description New description.
     */
    public async setDescription(description: string) {
        const response = await fetch(
            `https://api.twitch.tv/helix/users?description=${encodeURIComponent(description)}`,
            {
                method: "PUT",
                headers: {
                    authorization: `Bearer ${this.client.token}`,
                    "client-id": this.client.options.clientId,
                },
            }
        );

        if (!response.ok) {
            if (!this.client.options.suppressRejections) throw new HTTPError(response.statusText);

            return false;
        }

        const data: UserData = (await response.json()).data[0];

        this.setDescription(data.description);

        return true;
    }
}

export default ClientUser;
