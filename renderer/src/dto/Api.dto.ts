import { z } from 'zod';

import { AuthToken } from './Authentication.dto';

// Direct copy of the StatusReturn interface from Status.dto.ts
// Just because status return is 200 lines long and I want this file to be somewhat readable

export const BasicTokenAuthSchema = z.object({
    headers: z.custom<Headers>()
});

export const APIEndpointDefSchema = z.object({
    name: z.string(),
    requestParams: z.custom<PasswordChangeParamsType>().nullable(),
    requiresAuthToken: z.boolean(),
    uri: z.string(),
    fetchInit: z.custom<RequestInit>()
})

// Params for the constant defining api endpoints and their fetch options
export const APIEndpointDefinitionsSchema = z.array(
    z.object({
        majVersion: z.string(),
        endpoints: z.array(
            APIEndpointDefSchema
        )
    })
);

// Params required for changing the authenticated user password of a station
export const PasswordChangeParams = z.object({
    station_ip: z.string().ip({ version: 'v4' }),
    auth_token: AuthToken.optional(),
    change: z.string().default('yes').refine((v) => v === 'yes' || v === 'no', {
        message: 'change must be yes or no'
    }),
    ro: z.boolean().default(false).pipe(z.number()),
    pwd: z.string().min(12),
    oldPwd: z.string()
});
export type PasswordChangeParamsType = z.infer<typeof PasswordChangeParams>;

export const PasswordChangeResponse = z.object({
    fast_restart: z.boolean(),
    ok: z.boolean(),
    success: z.boolean(),
});
export type PasswordChangeResponseType = z.infer<typeof PasswordChangeResponse>;