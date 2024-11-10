import { z } from "zod"
import { AuthToken } from "./Authentication.dto"

export const AddColonsToPlainMAC = z.string().transform((plainMac) => {
    return plainMac.match(/.{1,2}/g)?.join(':')
})

// Transformer used to cast an array of cookies from a PostAuth response into a single auth token
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
    }).pipe(AuthToken)

export const StringToRecord = z.string().transform((rawRecord: string) => {
    return rawRecord.split('\n').reduce((acc, line) => {
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
}).pipe(z.record(z.string(), z.string()));
