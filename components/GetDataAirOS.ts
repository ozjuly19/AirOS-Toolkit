'use server'

import https from 'https'
import nfetch from 'node-fetch'
import { FormData } from 'node-fetch'
import { AuthReturn } from '@/types/AirOSApi'

import { z } from 'zod'

export async function apiAuth(username: string, password: string, station_ip: string) {
    // : Promise<nResposne> {
    const requestSchema = z.object({
        username: z.string(),
        password: z.string(),
        station_ip: z.string().ip({ version: "v4" })
    })

    requestSchema.parse({ username, password, station_ip })

    const agent = new https.Agent({
        rejectUnauthorized: false
    })

    const form = new FormData();
    form.set('username', username);
    form.set('password', password);

    const resp = await nfetch(`https://${station_ip}/api/auth`, {
        method: 'POST',
        agent: agent,
        body: form
    })

    if (!resp.ok) {
        throw new Error('Failed to authenticate with station')
    }

    let authCookieArray = resp.headers.raw()['set-cookie'];
    const authCookie = authCookieArray.find(
        (cookie: string) => cookie.startsWith('AIROS_')
    )?.split(';')[0];

    if (!authCookie) {
        throw new Error('No AIROS cookie found auth failed but, strangly...')
    }

    const returnObj = {
        status: resp.status,
        AIROS_AUTH: authCookie,
        json: AuthReturn.parse(await resp.json())
    }

    return returnObj
}