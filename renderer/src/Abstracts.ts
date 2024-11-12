import { PasswordChangeParamsType, PasswordChangeResponseType } from "./dto/Api.dto";
import { PostAuthParamsType, PostAuthReturnType, TokenAuthParamsType } from "./dto/Authentication.dto";
import { z } from "zod";

const StatusReturn_InterfacesObject = z.object({
    ifname: z.string(),
    hwaddr: z.string(),
    enabled: z.boolean(),
    mtu: z.number(),
    status: z.object({
        plugged: z.boolean(),
        tx_bytes: z.number(),
        rx_bytes: z.number(),
        tx_packets: z.number(),
        rx_packets: z.number(),
        tx_errors: z.number(),
        rx_errors: z.number(),
        tx_dropped: z.number(),
        rx_dropped: z.number(),
        ipaddr: z.string(),
        speed: z.number(),
        duplex: z.boolean(),
        snr: z.array(z.number()).optional(),
        cable_len: z.number().optional(),
    })
});

const StatusReturn_EvmArrays = z.array(
    z.array(z.number()),
    z.array(z.number())
)

const StatusReturn_StationObject = z.object({
    mac: z.string(),
    lastip: z.string(),
    signal: z.number(),
    rssi: z.number(),
    noisefloor: z.number(),
    chainrssi: z.array(z.number()),
    tx_idx: z.number(),
    rx_idx: z.number(),
    tx_nss: z.number(),
    rx_nss: z.number(),
    tx_latency: z.number(),
    distance: z.number(),
    tx_packets: z.number(),
    tx_lretries: z.number(),
    tx_sretries: z.number(),
    uptime: z.number(),
    dl_signal_expect: z.number(),
    ul_signal_expect: z.number(),
    cb_capacity_expect: z.number(),
    dl_capacity_expect: z.number(),
    ul_capacity_expect: z.number(),
    dl_rate_expect: z.number(),
    ul_rate_expect: z.number(),
    dl_linkscore: z.number(),
    ul_linkscore: z.number(),
    dl_avg_linkscore: z.number(),
    ul_avg_linkscore: z.number(),
    tx_ratedata: z.array(z.number()),
    stats: z.object({
        rx_bytes: z.number(),
        rx_packets: z.number(),
        rx_pps: z.number(),
        tx_bytes: z.number(),
        tx_packets: z.number(),
        tx_pps: z.number(),
    }),
    airmax: z.object({
        actual_priority: z.number(),
        beam: z.number(),
        desired_priority: z.number(),
        cb_capacity: z.number(),
        dl_capacity: z.number(),
        ul_capacity: z.number(),
        atpc_status: z.number(),
        rx: z.object({
            usage: z.number(),
            cinr: z.number(),
            evm: StatusReturn_EvmArrays,
        }),
        tx: z.object({
            usage: z.number(),
            cinr: z.number(),
            evm: StatusReturn_EvmArrays,
        }),
    }),
    last_disc: z.number(),
    remote: z.object({
        age: z.number(),
        device_id: z.string(),
        hostname: z.string(),
        platform: z.string(),
        version: z.string(),
        time: z.string(),
        cpuload: z.number(),
        temperature: z.number(),
        totalram: z.number(),
        freeram: z.number(),
        netrole: z.string(),
        mode: z.string(),
        sys_id: z.string(),
        tx_throughput: z.number(),
        rx_throughput: z.number(),
        uptime: z.number(),
        power_time: z.number(),
        compat_11n: z.number(),
        signal: z.number(),
        rssi: z.number(),
        noisefloor: z.number(),
        tx_power: z.number(),
        distance: z.number(),
        rx_chainmask: z.number(),
        chainrssi: z.array(z.number()),
        tx_ratedata: z.array(z.number()),
        tx_bytes: z.number(),
        rx_bytes: z.number(),
        antenna_gain: z.number(),
        cable_loss: z.number(),
        height: z.number(),
        ethlist: z.array(z.object({
            ifname: z.string(),
            enabled: z.boolean(),
            plugged: z.boolean(),
            duplex: z.boolean(),
            speed: z.number(),
            snr: z.array(z.number()),
            cable_len: z.number(),
        })),
        ipaddr: z.array(z.string()),
        ip6addr: z.array(z.string()),
        gps: z.object({
            lat: z.string(),
            lon: z.string(),
            fix: z.number(),
        }),
        oob: z.boolean(),
        unms: z.object({
            status: z.number(),
            timestamp: z.string(),
        }),
        airview: z.number(),
        service: z.object({
            time: z.number(),
            link: z.number(),
        }),
    })
});


export const StatusReturn = z.object({
    chain_names: z.array(
        z.object({
            number: z.number(),
            name: z.string(),
        })
    ),
    host: z.object({
        hostname: z.string(),
        device_id: z.string(),
        uptime: z.number(),
        power_time: z.number(),
        time: z.string(),
        timestamp: z.number(),
        fwversion: z.string(),
        devmodel: z.string(),
        netrole: z.string(),
        loadavg: z.number(),
        totalram: z.number(),
        freeram: z.number(),
        temperature: z.number(),
        cpuload: z.number(),
        height: z.number(),
    }),
    genuine: z.string(),
    services: z.object({
        dhcpc: z.boolean(),
        dhcpd: z.boolean(),
        dhcp6d_stateful: z.boolean(),
        pppoe: z.boolean(),
        airview: z.number(),
    }),
    firewall: z.object({
        iptables: z.boolean(),
        ebtables: z.boolean(),
        ip6tables: z.boolean(),
        eb6tables: z.boolean(),
    }),
    portfw: z.boolean(),
    wireless: z.object({
        essid: z.string(),
        mode: z.string(),
        ieeemode: z.string(),
        band: z.number(),
        compat_11n: z.number(),
        hide_essid: z.number(),
        apmac: z.string(),
        antenna_gain: z.number(),
        frequency: z.number(),
        center1_freq: z.number(),
        dfs: z.number(),
        distance: z.number(),
        security: z.string(),
        noisef: z.number(),
        txpower: z.number(),
        aprepeater: z.boolean(),
        rstatus: z.number(),
        chanbw: z.number(),
        rx_chainmask: z.number(),
        tx_chainmask: z.number(),
        nol_state: z.number(),
        nol_timeout: z.number(),
        cac_state: z.number(),
        cac_timeout: z.number(),
        rx_idx: z.number(),
        rx_nss: z.number(),
        tx_idx: z.number(),
        tx_nss: z.number(),
        throughput: z.object({
            rx: z.number(),
            tx: z.number(),
        }),
        service: z.object({
            time: z.number(),
            link: z.number(),
        }),
        polling: z.object({
            cb_capacity: z.number(),
            dl_capacity: z.number(),
            ul_capacity: z.number(),
            use: z.number(),
            tx_use: z.number(),
            rx_use: z.number(),
            atpc_status: z.number(),
            fixed_frame: z.boolean(),
            gps_sync: z.boolean(),
            ff_cap_rep: z.boolean()
        }),
        count: z.number(),
        sta: z.array(StatusReturn_StationObject),
        sta_disconnected: z.array(z.unknown()), // Unknown at this time but it's an object array
    }),
    interfaces: z.array(
        StatusReturn_InterfacesObject
    ),
    provmode: z.unknown(), // Unknown at this time but it's an object
    ntpclient: z.object({
        last_sync: z.string().optional(),
    }).optional(),
    unms: z.object({
        status: z.number(),
        timestamp: z.string(),
    }),
    gps: z.object({
        lat: z.number(),
        lon: z.number(),
        fix: z.number(),
    }),
});

export type StatusReturnType = z.infer<typeof StatusReturn>;
export abstract class AbstractApiMethods {
    // Authentication methods
    abstract returnAndStoreAuthToken(params: PostAuthParamsType): Promise<PostAuthReturnType>;

    // Getter methods for the API
    abstract getConfig(params: TokenAuthParamsType): Promise<Record<string, string>>;
    abstract getStatus(params: TokenAuthParamsType): Promise<StatusReturnType>;

    // Setter methods for the API
    abstract setTokenUserPassword(params: PasswordChangeParamsType): Promise<PasswordChangeResponseType>;
    // abstract setConfig(params: authDto.TokenAuthParamsType): Promise<Record<string, string>>;
    // abstract setStatus(params: authDto.TokenAuthParamsType): Promise<Record<string, string>>;
}