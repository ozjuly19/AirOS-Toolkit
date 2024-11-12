import { AbstractApiMethods } from "@/src/Abstracts";
import * as authDto from "@/src/dto/Authentication.dto";
import * as apiDto from "@/src/dto/Api.dto";
import { StringToRecord } from "@/src/dto/Transformers";
import { StatusReturn, StatusReturnType } from "@/src/Abstracts";

export default class v8 extends AbstractApiMethods {
    uris = {
        getStatus: '/status.cgi',
        getConfig: '/getcfg.cgi',
        setPassword: '/pwd.cgi',
        postAuth: '/api/auth',
    }

    // Getters
    async returnAndStoreAuthToken(params: authDto.PostAuthParamsType): Promise<authDto.PostAuthReturnType> {
        const form = new FormData();
        form.set('username', params.username);
        form.set('password', params.password);

        const fres = await this._fetchWithRaw(
            this._buildUrl(
                params.station_ip,
                this.uris.postAuth
            ),
            {
                method: 'POST',
                body: form,
            },
        );

        const ret = authDto.PostAuthReturn.parse({
            status: fres.response.status,
            json: fres.body,
            station_ip: params.station_ip,
            auth_token: authDto.HijackedHeadersToAuthToken.parse(Array.from(fres.response.headers.entries())),
        });

        return ret;
    }
    async getConfig({ station_ip, auth_token }: authDto.TokenAuthParamsType): Promise<Record<string, string>> {
        if (!auth_token) throw new Error('auth_token is required for this function');

        return this._fetch(
            this._buildUrl(
                station_ip,
                this.uris.getConfig
            ),
            StringToRecord.parse,
            { headers: this._buildAuthTokenHeader(auth_token) }
        );
    }
    async getStatus({ station_ip, auth_token }: authDto.TokenAuthParamsType): Promise<StatusReturnType> {
        if (!auth_token) throw new Error('auth_token is required for this function');

        return this._fetch(
            this._buildUrl(
                station_ip,
                this.uris.getStatus
            ),
            StatusReturn.parse,
            { headers: this._buildAuthTokenHeader(auth_token) }
        );
    }

    // Setters
    async setTokenUserPassword(params: apiDto.PasswordChangeParamsType): Promise<apiDto.PasswordChangeResponseType> {
        throw new Error('Method not implemented.');
    }

    // Private utility functions

    // Easy shorthand for building a URL to fetch
    private _buildUrl = (station_ip: string, endpoint: string): URL => new URL(`https://${station_ip}${endpoint}`);

    // Constructs a auth token header for the fetch request to be AuthN'd
    private _buildAuthTokenHeader(authToken: authDto.AuthTokenType): Headers {
        const headers = new Headers();
        // Add authorization token to the headers
        headers.set('ather_request_cookies', authToken);
        return headers;
    }

    // Fetches a URL and parses the response with the provided parser
    /**
     * Fetches data from a given URL, returns a raw result.
     *
     * @param url - The URL to fetch data from.
     * @param options - The options to pass to the fetch request.
     * @returns A promise that resolves with the parsed response.
     * @throws Will throw an error if the fetch request fails, if deserialization fails, if preprocessing fails, or if parsing fails.
     */
    private async _fetchWithRaw(url: URL, options: RequestInit): Promise<{ response: Response, body: any }> {
        let response = await fetch(url, options);

        // Check if the request went through if not error out
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

        // Check if the response is JSON
        const isJson = response.headers.get('Content-Type')?.includes('application/json');

        let body;

        // Deserialize the response
        try {
            body = isJson ? await response.json() : await response.text();
        } catch (error) {
            throw new Error(`Failed to deserialize station response: ${error}`);
        }

        return { response, body };
    }

    /**
     * Fetches data from a given URL and parses it.
     *
     * @param url - The URL to fetch data from.
     * @param parser - A function to parse the deserialized response.
     * @param options - The options to pass to the fetch request.
     * @returns A promise that resolves with the parsed response.
     * @throws Will throw an error if the fetch request fails, if deserialization fails, if preprocessing fails, or if parsing fails.
     */
    private async _fetch(url: URL, parser: Function, options: RequestInit): Promise<any> {
        let response = await fetch(url, options);

        // Check if the request went through if not error out
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

        // Check if the response is JSON
        const isJson = response.headers.get('Content-Type')?.includes('application/json');

        let respDeserialized;

        // Deserialize the response
        try {
            respDeserialized = isJson ? await response.json() : await response.text();
        } catch (error) {
            throw new Error(`Failed to deserialize station response: ${error}`);
        }

        // Parse the response
        try {
            return parser(respDeserialized);
        } catch (error) {
            throw new Error(`Failed to parse station response: ${error}`);
        }
    }
}