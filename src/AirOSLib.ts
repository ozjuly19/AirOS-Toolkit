'use client'

import { AuthContextDataType, AuthTokenStoreType, PostAuthParams, PostAuthParamsType, PostAuthReturnType } from "@/src/dto/Authentication.dto";
import { FetchWithFormData } from "@/src/ServerSideFunctions";
import { CookieArrayToAuthToken } from "./dto/Transformers";
import React from "react";

export const AirOSAuthContext = React.createContext<AuthContextDataType>({
    AirOSTokens: [],
    setAirOSTokens: () => { },
    AuthResponses: [],
    setAuthResponses: () => { }
});

export class AirOSAuthentication {
    private ctx: AuthContextDataType;

    constructor(ctx: AuthContextDataType) {
        this.ctx = ctx;
    }

    // Fetch all tokens
    GetAllTokensStatus(): AuthTokenStoreType[] {
        return this.ctx.AirOSTokens;
    }

    // Fetch one auth response by IP
    GetAuthResponseByIP(station_ip: string): PostAuthReturnType | undefined {
        return this.ctx.AuthResponses.find((authResp) => authResp.station_ip === station_ip);
    }

    // Add a response to the list or update it if it already exists
    private _UpdateAuthResponse(AuthResponse: PostAuthReturnType): void {
        const respIndex = this.ctx.AuthResponses.findIndex((authResp) => authResp.station_ip === AuthResponse.station_ip);

        if (respIndex > -1) {
            this.ctx.setAuthResponses([
                ...this.ctx.AuthResponses.slice(0, respIndex),
                AuthResponse,
                ...this.ctx.AuthResponses.slice(respIndex + 1)
            ]);
            return;
        }

        this.ctx.setAuthResponses([...this.ctx.AuthResponses, AuthResponse]);
    }

    // Search for a token by IP and update the data if found, otherwise add it to the list
    private _UpdateTokenStatus(tokenData: AuthTokenStoreType): void {
        const tokenIndex = this.ctx.AirOSTokens.findIndex((token) => token.station_ip === tokenData.station_ip);

        if (tokenIndex > -1) {
            this.ctx.setAirOSTokens([
                ...this.ctx.AirOSTokens.slice(0, tokenIndex),
                tokenData,
                ...this.ctx.AirOSTokens.slice(tokenIndex + 1)
            ]);
        }

        this.ctx.setAirOSTokens([...this.ctx.AirOSTokens, tokenData]);
    }

    async PostAuth({ username, password, station_ip }: PostAuthParamsType): Promise<PostAuthReturnType> {
        PostAuthParams.parse({ username, password, station_ip })

        const resp = await FetchWithFormData(`https://${station_ip}/api/auth`, { 'username': username, 'password': password }, { method: 'POST' })

        if (!resp.ok) {
            throw new Error('Failed to authenticate with station')
        }

        let authCookieArray = resp.headers.raw['set-cookie'];
        const auth_token = CookieArrayToAuthToken.parse(authCookieArray);

        if (!auth_token) {
            throw new Error('No AIROS cookie found! Auth failed but, strangly...')
        }

        this._UpdateTokenStatus({
            station_ip,
            auth_token,
            isValid: true
        });

        const cAuthResponse = {
            station_ip,
            ...resp
        } as PostAuthReturnType;

        this._UpdateAuthResponse(cAuthResponse);

        // If there is something more robust needed I'll edit this but a cast is stupid easy to understand and write lol
        return cAuthResponse;
    }
}
