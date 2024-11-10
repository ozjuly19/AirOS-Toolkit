import { z } from 'zod'
import { StringToRecord } from './Transformers';

// The station response if authentication is successful
export const AuthSuccessReturn = z.object({
    readOnlyUser: z.boolean(),
    ccode: z.number(),
    boardinfo: z
        .string().pipe(StringToRecord),
    rd: z.array(z.string()),
    fullVersion: z.string(),
});
export type AuthSuccessReturnType = z.infer<typeof AuthSuccessReturn>;

// Data returned from PostAuth function
export const PostAuthReturn = z.object({
    status: z.number(),
    json: AuthSuccessReturn,
    station_ip: z.string().ip({ version: 'v4' }),
});
export type PostAuthReturnType = z.infer<typeof PostAuthReturn>;

// Params required for authentication to a station
export const PostAuthParams = z.object({
    username: z.string(),
    password: z.string(),
    station_ip: z.string().ip({ version: "v4" })
});
export type PostAuthParamsType = z.infer<typeof PostAuthParams>;

export const AuthToken = z.string().length(51).includes('AIROS_');
export type AuthTokenType = z.infer<typeof AuthToken>;

// Used in AirOSLib mainly for storing JWTs
export const AuthTokenStore = z.object({
    auth_token: AuthToken,
    station_ip: z.string().ip({ version: 'v4' }),
    isValid: z.boolean()
});
export type AuthTokenStoreType = z.infer<typeof AuthTokenStore>;

export const AuthContextData = z.object({
    AirOSTokens: z.array(AuthTokenStore).default([]),
    setAirOSTokens: z.any(),
    AuthResponses: z.array(PostAuthReturn).default([]),
    setAuthResponses: z.any(),
});
export type AuthContextDataType = z.infer<typeof AuthContextData>;

export const HijackedHeadersToAuthToken =
    z.array(
        z.array(
            z.string()
        )
    ).transform((HeaderArr) => {
        const c = HeaderArr.find((cookieArr) => {
            return cookieArr[0] === 'ather_hijack_airos_cookie'
        });

        return c ? c[1] : undefined;
    }).pipe(AuthToken);