import { z } from "zod"

export const AddColonsToPlainMAC = z.string().transform((plainMac) => {
    return plainMac.match(/.{1,2}/g)?.join(':')
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
}).pipe(z.record(z.string(), z.string()));