import { z } from "zod";
import { AuthTokenType } from "./Authentication.dto";

// Make a static type to represent the response from a fetch request so it can be passed from server -> client
export const FetchResponse = z.object({
    headers: z.object({
        raw: z.record(z.array(z.string())),
    }),
    ok: z.boolean(),
    redirected: z.boolean(),
    status: z.number(),
    statusText: z.string(),
    type: z.string(),
    url: z.string(),
    json: z.record(z.any(), z.any()),
});
export type FetchResponseType = z.infer<typeof FetchResponse>;

// Vars required to make authenticated general GET calls to the api
export const AuthedGetParams = z.object({
    auth_token: z.custom<AuthTokenType>(),
    station_ip: z.string().ip({ version: 'v4' }),
});
export type AuthedGetParamsType = z.infer<typeof AuthedGetParams>;