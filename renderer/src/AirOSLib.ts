'use client'

import { AuthContextDataType, AuthTokenStoreType, AuthTokenType, HijackedHeadersToAuthToken, PostAuthParamsType, PostAuthReturn, PostAuthReturnType } from "@/src/dto/Authentication.dto";
import { StringToRecord } from "./dto/Transformers";
import React from "react";
import { AuthedGetParams, AuthedGetParamsType, FetchResponseType } from "./dto/Fetch.dto";

export const AirOSAuthContext = React.createContext<AuthContextDataType>({
    AirOSTokens: [],
    setAirOSTokens: () => { },
    AuthResponses: [],
    setAuthResponses: () => { }
});

// The goal of this class is to make api calls version agnostic, so if the API changes I can just update the class and not the entire codebase
export class AirOSAPICompatabilityLayer {
    APIEndpts = {
        versionType: {
            endpointType: {
                requiresAuthToken: false,
                endpoint: '',
                fetchInit: {
                    method: ''
                }
            }
        },
        v8: {
            getStatus: {
                requiresAuthToken: true,
                endpoint: '/status.cgi',
                fetchInit: {
                    method: 'GET'
                }
            },
            getConfig: {
                requiresAuthToken: true,
                endpoint: '/getcfg.cgi',
                fetchInit: {
                    method: 'GET',
                }
            },
            doAuth: {
                requiresAuthToken: false,
                endpoint: '/api/auth',
                fetchInit: {
                    method: 'POST'
                }
            }
        },
    }

    private async _ConstructFetchResponse(resp: Response): Promise<FetchResponseType> {
        let json: any;

        // Handle the weird json issues
        if (resp.headers.get('Content-Type')?.includes('application/json'))
            json = await resp.json();
        else
            json = StringToRecord.parse(await resp.text());

        return {
            status: resp.status,
            statusText: resp.statusText,
            ok: resp.ok,
            headerArray: Array.from(resp.headers.entries()),
            json
        };
    }

    private async _AbstractFWCV(station_ip: string, headers: Headers, EndpointData: typeof this.APIEndpts.versionType.endpointType): Promise<FetchResponseType> {
        const ret = await fetch(`https://${station_ip}${EndpointData.endpoint}`, {
            headers,
            ...EndpointData.fetchInit
        })

        return await this._ConstructFetchResponse(ret);
    }

    PostAuth_Safe = async ({ username, password, station_ip }: PostAuthParamsType): Promise<FetchResponseType> => {
        // Create form data
        const formData = new FormData();
        formData.set('username', username);
        formData.set('password', password);

        return this._ConstructFetchResponse(await fetch(`https://${station_ip}${this.APIEndpts.v8.doAuth.endpoint}`, {
            body: formData,
            ...this.APIEndpts.v8.doAuth.fetchInit
        }));
    }

    GetConfig_Safe = async (station_ip: string, headers: Headers) => this._AbstractFWCV(station_ip, headers, this.APIEndpts.v8.getConfig);
    GetStatus_Safe = async (station_ip: string, headers: Headers) => this._AbstractFWCV(station_ip, headers, this.APIEndpts.v8.getStatus);
}

export class AuthDataHandler {
    protected authCtx: AuthContextDataType;

    constructor(authCtx: AuthContextDataType) {
        this.authCtx = authCtx;
    }

    updateOrAddItem<T>(items: T[], newItem: T, predicate: (item: T) => boolean, setItems: React.Dispatch<React.SetStateAction<T[]>>): void {
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
    protected UpdateAuthResponse(AuthResponse: PostAuthReturnType): void {
        this.updateOrAddItem(
            this.authCtx.AuthResponses,
            AuthResponse,
            (authResp) => authResp.station_ip === AuthResponse.station_ip,
            this.authCtx.setAuthResponses
        );
    }

    // Search for a token by IP and update the data if found, otherwise add it to the list
    protected UpdateTokenStatus(tokenData: AuthTokenStoreType): void {
        this.updateOrAddItem(
            this.authCtx.AirOSTokens,
            tokenData,
            (token) => token.station_ip === tokenData.station_ip,
            this.authCtx.setAirOSTokens
        );
    }
}

export class AirOSAuthentication extends AuthDataHandler {
    protected aOSAPI_CL: AirOSAPICompatabilityLayer;

    constructor(authCtx: AuthContextDataType) {
        super(authCtx);
        this.aOSAPI_CL = new AirOSAPICompatabilityLayer();
    }

    // Generic function to make authenticated GET calls to the API and manage the token auth status
    protected async AuthedGetCall_Middleware(endpoint: Function, callParams: AuthedGetParamsType): Promise<FetchResponseType> {
        let resp: FetchResponseType;

        const headers = new Headers();
        headers.set('ather_request_cookies', callParams.auth_token);

        // Make a call through the compatability class to the API for authentication
        resp = await endpoint(callParams.station_ip, headers);

        // Auth failure
        if (resp.status == 403) {
            // Token is no longer valid so update the status to invalid
            this.UpdateTokenStatus({
                station_ip: callParams.station_ip,
                auth_token: callParams.auth_token,
                isValid: false
            });

            throw new Error('Authentication token is invalid')
        }

        // General failure
        if (!resp.ok) throw new Error('Failed to fetch data from station')

        return resp;
    }

    // Fetch all tokens
    GetAllTokensStatus(): AuthTokenStoreType[] {
        return this.authCtx.AirOSTokens;
    }

    // Fetch one auth response by IP
    GetAuthResponseByIP(station_ip: string): PostAuthReturnType | undefined {
        return this.authCtx.AuthResponses.find((authResp) => authResp.station_ip === station_ip);
    }

    async PostAuth(PAP: PostAuthParamsType): Promise<PostAuthReturnType> {
        // Make a call through the compatability class to the API for authentication
        const resp = await this.aOSAPI_CL.PostAuth_Safe(PAP);

        // Extract station IP from the params
        const station_ip = PAP.station_ip;


        if (!resp.ok) {
            throw new Error('Failed to authenticate with station')
        }

        // Pass the headers to the transformer to extract the auth token from a hijacked cookie
        const auth_token = HijackedHeadersToAuthToken.parse(Array.from(resp.headerArray));

        if (!auth_token) {
            throw new Error('No AIROS cookie found! Auth failed but, strangly...')
        }

        this.UpdateTokenStatus({
            station_ip,
            auth_token,
            isValid: true
        });

        const cAuthResponse = PostAuthReturn.parse({
            station_ip,
            status: resp.status,
            json: resp.json,
        });

        this.UpdateAuthResponse(cAuthResponse);

        // If there is something more robust needed I'll edit this but a cast is stupid easy to understand and write lol
        return cAuthResponse;
    }
}

export class AirOSGeneralAPI extends AirOSAuthentication {

    constructor(authCtx: AuthContextDataType) {
        super(authCtx);
    }

    async GetConfig(station_ip: string, auth_token?: AuthTokenType): Promise<FetchResponseType> {
        const token = auth_token ?? this.authCtx.AirOSTokens.find((token) => token.isValid)?.auth_token;

        if (!token) throw new Error('No valid auth token found');

        const AGPT = AuthedGetParams.parse({ station_ip, auth_token: token });
        const resp = await this.AuthedGetCall_Middleware(this.aOSAPI_CL.GetConfig_Safe, AGPT);

        return resp;
    }

    async GetStatus(station_ip: string, auth_token?: AuthTokenType): Promise<FetchResponseType> {
        const token = auth_token ?? this.authCtx.AirOSTokens.find((token) => token.isValid)?.auth_token;

        if (!token) throw new Error('No valid auth token found');

        const AGPT = AuthedGetParams.parse({ station_ip, auth_token: token });
        const resp = await this.AuthedGetCall_Middleware(this.aOSAPI_CL.GetStatus_Safe, AGPT);

        return resp;
    }
}
