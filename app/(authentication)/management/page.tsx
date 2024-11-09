'use client'

import React from 'react';
import { Box, Button, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';

import StationAuthForm from '@/components/StationAuthForm';
import { AuthTokenStoreType, PostAuthReturnType } from '@/src/dto/Authentication.dto';
import { AirOSAuthContext, AirOSAuthentication } from '@/src/AirOSLib';
import { AuthDataTabs } from '@/components/AuthDataTabs';

export default function HomePage() {
  const ctx = React.useContext(AirOSAuthContext);
  const { AirOSTokens } = ctx;
  const [selectedStation, setSelectedStation] = React.useState<AuthTokenStoreType>({ station_ip: '', auth_token: '', isValid: false });
  const [authFormOpen, setAuthFormOpen] = React.useState(false);
  const [authResponse, setAuthResponse] = React.useState<PostAuthReturnType>();

  const drawMenuItems = AirOSTokens.map((token) => {
    if (!token) return null;

    return (
      <MenuItem key={token.station_ip} value={token.station_ip}>{token.station_ip}</MenuItem>
    );
  });

  const changeSelectedStation = React.useCallback((event: SelectChangeEvent) => {
    const station_ip = event.target.value as string;
    const token = AirOSTokens.find((token) => token.station_ip === station_ip);

    if (token) {
      setSelectedStation(token);
    }
  }, [AirOSTokens]);

  React.useEffect(() => {
    if (AirOSTokens.length > 0 && selectedStation.station_ip === '') {
      changeSelectedStation({ target: { value: AirOSTokens[0].station_ip } } as SelectChangeEvent);
    }
  }, [AirOSTokens, changeSelectedStation, selectedStation.station_ip]);

  React.useEffect(() => {
    const airOSAuthClass = new AirOSAuthentication(ctx);
    const json = airOSAuthClass.GetAuthResponseByIP(selectedStation.station_ip);
    if (json) setAuthResponse(json);
  }, [ctx, selectedStation.station_ip]);

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        {AirOSTokens.length > 0 && selectedStation.station_ip !== '' &&
          <Select
            value={selectedStation.station_ip}
            onChange={changeSelectedStation}
          >
            {drawMenuItems}
          </Select>
        }
        <Button onClick={() => setAuthFormOpen(true)}>Add New Station</Button>
      </Stack>

      <Box marginTop={1}>
        {authResponse &&
          <AuthDataTabs AuthReturnJson={authResponse.json} />
        }
      </Box>

      <StationAuthForm open={authFormOpen} setOpen={setAuthFormOpen} />
    </Box>
  );
}
