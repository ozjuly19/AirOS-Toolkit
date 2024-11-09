import { z } from "zod"
import { AuthToken } from "./Authentication.dto"

export const AddColonsToPlainMAC = z.string().transform((plainMac) => {
    return plainMac.match(/.{1,2}/g)?.join(':')
})

// Transformer used to cast an array of cookies from a PostAuth response into a single auth token
export const CookieArrayToAuthToken = z.array(z.string()).transform((cookieArr) => {
    return AuthToken.parse(cookieArr.find((index) => index.includes('AIROS_'))?.split(';')[0])
})
