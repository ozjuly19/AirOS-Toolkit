'use client'

import { AirOSAuthContext, ApiInterface, AuthDataHandler } from "@/src/AirOSApi.lib";
import { Box, Button, Stack, TextField } from "@mui/material"
import React from "react"
import { toast } from "react-toastify"

export default function ConnectionManagerPage() {
    const ctx = React.useContext(AirOSAuthContext);
    const apiInterface = React.useMemo(() => new ApiInterface(new AuthDataHandler(ctx)), []);

    const testAuth = () => {
        const station_ip = (document.getElementById('ipaddr') as HTMLInputElement).value;

        apiInterface.getConfig({ station_ip })
            .then((response) => {
                toast.success(`Successfully Authenticated with ${station_ip}`);
            })
            .catch((error) => {
                toast.error(`Failed to Authenticate with ${station_ip}`);
                console.error(error);
            });
    };

    return (
        <Box>
            <Stack sx={{ margin: 1 }} direction="row" spacing={1}>
                <TextField
                    id='ipaddr'
                    label="IP Address"
                    placeholder="192.168.1.10"
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            testAuth();
                        }
                    }}
                />
                <Button onClick={testAuth} variant='outlined'>Test Auth & Connection</Button>
            </Stack>
        </Box>
    )
}