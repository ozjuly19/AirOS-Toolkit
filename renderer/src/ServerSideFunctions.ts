'use server'

import https from 'https'
import nfetch, { RequestInit, RequestInfo, FormData } from 'node-fetch'
import { FetchResponseType } from './dto/Fetch.dto';
import { StringToRecord } from './dto/Transformers';

export async function FetchWithFormData(url: URL | RequestInfo, FormDataKeyVal: Record<string, string>, init?: RequestInit): Promise<FetchResponseType> {
    const formData = new FormData();

    Object.entries(FormDataKeyVal).forEach(([key, val]) => {
        formData.set(key, val);
    })

    return FetchWithoutCertVerify(url, {
        ...init,
        body: formData
    })
}


export async function FetchWithoutCertVerify(url: URL | RequestInfo, init?: RequestInit): Promise<FetchResponseType> {
    const CustAgentInit = {
        agent: new https.Agent({
            rejectUnauthorized: false
        }),
        ...init
    } as RequestInit

    const resp = await nfetch(url, CustAgentInit);

    let json: any;

    if (!resp.ok)
        json = { error: resp.statusText }
    else
        resp.headers.get('content-type')?.includes('application/json') ?
            json = await resp.json() : json = StringToRecord.parse(await resp.text()); // Convert record responses to "JSON" objects

    return {
        headers: { raw: resp.headers.raw() },
        ok: resp.ok,
        redirected: resp.redirected,
        status: resp.status,
        statusText: resp.statusText,
        type: resp.type,
        url: resp.url,
        json
    }
}
