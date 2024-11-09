import { z } from "zod";

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
    json: z.any()
});
export type FetchResponseType = z.infer<typeof FetchResponse>;