import { set, z } from 'zod'

// Used in AirOSLib mainly for storing JWTs
export const AuthTokenMeta = z.object({
    auth_token: z.string(),
    station_ip: z.string().ip({ version: 'v4' }),
    isValid: z.boolean()
});
export type AuthTokenStoreType = z.infer<typeof AuthTokenMeta>;

// The station response if authentication is successful
export const AuthSuccessReturn = z.object({
    readOnlyUser: z.boolean(),
    ccode: z.number(),
    boardinfo: z
        .string()
        .transform((rawBoardInfo: string) => {
            return rawBoardInfo.split('\n').reduce((acc, line) => {
                const splitty = line.split('=');

                if (splitty.length === 2) {
                    const [key, value] = splitty;

                    acc[key] = value;
                }

                if (splitty.length > 2) {
                    const key = splitty[0];
                    const value = splitty.slice(1).join('=');

                    acc[key] = value;
                }

                return acc;
            }, {} as Record<string, string>);
        }),
    rd: z.array(z.string()),
    fullVersion: z.string(),
});
export type AuthSuccessReturnType = z.infer<typeof AuthSuccessReturn>;

// Data returned from PostAuth function
export const PostAuthReturn = z.object({
    status: z.number(),
    json: AuthSuccessReturn.transform((json) => AuthSuccessReturn.parse(json.boardinfo)),
    station_ip: z.string().ip({ version: 'v4' }),
});
export type PostAuthReturnType = z.infer<typeof PostAuthReturn>;

// Params required for authentication to a station
export const PostAuthParams = z.object({
    username: z.string(),
    password: z.string(),
    station_ip: z.string().ip({ version: "v4" })
})
export type PostAuthParamsType = z.infer<typeof PostAuthParams>;

export const AuthToken = z.string().length(51).includes('AIROS_');
export type AuthTokenType = z.infer<typeof AuthToken>;

export const AuthContextData = z.object({
    AirOSTokens: z.array(AuthTokenMeta).default([]),
    setAirOSTokens: z.any(),
    AuthResponses: z.array(PostAuthReturn).default([]),
    setAuthResponses: z.any(),
});
export type AuthContextDataType = z.infer<typeof AuthContextData>;