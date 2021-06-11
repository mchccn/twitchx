import { ClientScope } from "./client";

export interface LoginResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: ClientScope[];
    token_type: "bearer";
}

export interface ValidateResponse {
    client_id: string;
    login?: string;
    scopes: ClientScope[];
    user_id?: string;
    expires_in: number;
}

export interface ErrorResponse {
    status: number;
    message: string;
}

export * from "./client";
