'use client'

import {
    AuthContextDataType,
    AuthTokenStoreType,
    PostAuthReturnType
} from "@/src/dto/Authentication.dto";
import React from "react";
import * as authDto from "./dto/Authentication.dto";
import * as apiDto from "./dto/Api.dto";
import { AbstractApiMethods, StatusReturnType } from "@/src/Abstracts";
import AirOSv8 from "./VersionSpecificClasses/AirOSv8";

export const AirOSAuthContext = React.createContext<AuthContextDataType>({
    AirOSTokens: [],
    setAirOSTokens: () => { },
    AuthResponses: [],
    setAuthResponses: () => { },
    CredentialStore: [],
    setCredentialStore: () => { },
});

// Use this guy for managing auth data
export class AuthDataHandler {
    protected authCtx: AuthContextDataType;

    constructor(authCtx: AuthContextDataType) {
        this.authCtx = authCtx;
    }

    private updateOrAddItem<T>(items: T[], newItem: T, predicate: (item: T) => boolean, setItems: React.Dispatch<React.SetStateAction<T[]>>): void {
        const itemIndex = items.findIndex(predicate);

        // This might look a bit weird but this is seemingly required to get the state to properly update, you must create a new object not just mutate it.
        if (itemIndex > -1) {
            setItems([
                ...items.slice(0, itemIndex),
                newItem,
                ...items.slice(itemIndex + 1)
            ]);
        } else {
            // Same here, recreate not mutate
            setItems([...items, newItem]);
        }
    }

    // Add a response to the list or update it if it already exists
    UpdateAuthResponse(AuthResponse: PostAuthReturnType): void {
        this.updateOrAddItem(
            this.authCtx.AuthResponses,
            AuthResponse,
            (authResp) => authResp.station_ip === AuthResponse.station_ip,
            this.authCtx.setAuthResponses
        );
    }

    // Search for a token by IP and update the data if found, otherwise add it to the list
    UpdateTokenStatus(tokenData: AuthTokenStoreType): void {
        this.updateOrAddItem(
            this.authCtx.AirOSTokens,
            tokenData,
            (token) => token.station_ip === tokenData.station_ip,
            this.authCtx.setAirOSTokens
        );
    }

    // Fetch all tokens
    GetAllTokensStatus(): AuthTokenStoreType[] {
        return this.authCtx.AirOSTokens;
    }

    // Fetch one auth response by IP
    GetAuthResponseByIP(station_ip: string): PostAuthReturnType | undefined {
        return this.authCtx.AuthResponses.find((authResp) => authResp.station_ip === station_ip);
    }

    async getTokenByIP(station_ip: string): Promise<AuthTokenStoreType | undefined> {
        // Lookup in the database
        const storedToken = this.authCtx.AirOSTokens.find((token) => token.station_ip === station_ip);
        if (storedToken) return storedToken;

        const apiInterface = new ApiInterface(this);

        // If not found in the database attempt to authenticate with the credential store
        for (const cred of this.authCtx.CredentialStore) {
            console.log(`Attempting to authenticate with cred id ${cred.order} at ${station_ip}`);

            const token = await apiInterface.returnAndStoreAuthToken({
                station_ip,
                username: cred.username,
                password: cred.password
            }).catch((error) => {
                console.error(error, `'Credential #: ${cred.order}\nIP: ${station_ip}`);
            });

            if (token) {
                return { ...token, isValid: true } as AuthTokenStoreType;
            }
        }
    }
}

// Use this guy for maing api calls
export class ApiInterface extends AbstractApiMethods {
    private apiv8: AirOSv8;

    constructor(private auth: AuthDataHandler) {
        super()
        this.apiv8 = new AirOSv8();
    }
    // Getters
    async returnAndStoreAuthToken(params: authDto.PostAuthParamsType): Promise<authDto.PostAuthReturnType> {
        const ret = await this.apiv8.returnAndStoreAuthToken(params);

        // Store the token in the auth store
        this.auth.UpdateTokenStatus({
            auth_token: ret.auth_token,
            station_ip: ret.station_ip,
            isValid: true,
        });

        // Store the response in the auth store
        this.auth.UpdateAuthResponse(ret);

        return ret;
    }
    async getConfig(params: authDto.TokenAuthParamsType): Promise<Record<string, string>> {
        if (!params.auth_token) params.auth_token = (await this.auth.getTokenByIP(params.station_ip))?.auth_token;
        return this.apiv8.getConfig(params)
    }
    async getStatus(params: authDto.TokenAuthParamsType): Promise<StatusReturnType> {
        if (!params.auth_token) params.auth_token = (await this.auth.getTokenByIP(params.station_ip))?.auth_token;
        return this.apiv8.getStatus(params)
    }
    // Setters
    async setTokenUserPassword(params: apiDto.PasswordChangeParamsType): Promise<apiDto.PasswordChangeResponseType> {
        if (!params.auth_token) params.auth_token = (await this.auth.getTokenByIP(params.station_ip))?.auth_token;
        return this.apiv8.setTokenUserPassword(params)
    }

}
