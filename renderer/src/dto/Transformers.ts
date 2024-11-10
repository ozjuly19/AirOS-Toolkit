import { z } from "zod"
import { AuthToken } from "./Authentication.dto"

export const AddColonsToPlainMAC = z.string().transform((plainMac) => {
    return plainMac.match(/.{1,2}/g)?.join(':')
})

// Transformer used to cast an array of cookies from a PostAuth response into a single auth token
export const CookieArrayToAuthToken = z.array(z.string()).transform((cookieArr) => {
    return AuthToken.parse(cookieArr.find((index) => index.includes('AIROS_'))?.split(';')[0])
})

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
})
