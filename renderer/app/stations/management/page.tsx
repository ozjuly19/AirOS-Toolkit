'use client'

import React from 'react';
import { Box, Button, MenuItem, Select, SelectChangeEvent, Stack, Tab, Tabs, Typography } from '@mui/material';

import StationAuthForm from '@/components/StationAuthForm';
import { AuthTokenStoreType, PostAuthReturnType } from '@/src/dto/Authentication.dto';
import { AirOSAuthContext, ApiInterface, AuthDataHandler, } from '@/src/AirOSLib';
import { RecordViewTable } from '@/components/RecordViewTable';
import JsonObjectViewTree from '@/components/JsonObjectViewTree';
import { StatusReturnType } from '@/src/Abstracts';

export default function ManagementPage() {
  const ctx = React.useContext(AirOSAuthContext);
  const { AirOSTokens } = ctx;
  const [selectedStation, setSelectedStation] = React.useState<AuthTokenStoreType>({ station_ip: '', auth_token: '', isValid: false });
  const [authFormOpen, setAuthFormOpen] = React.useState(false);
  const [authResponse, setAuthResponse] = React.useState<PostAuthReturnType>();
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [AOSConfig, setAOSConfig] = React.useState<Record<string, string>>();
  const [AOSStatus, setAOSStatus] = React.useState<StatusReturnType>();
  const apiInterface = React.useMemo(() => new ApiInterface(new AuthDataHandler(ctx)), []);

  const areStationsAddedAndSelected = AirOSTokens.length > 0 && selectedStation.station_ip !== '' && AirOSTokens.find((token) => { return token.isValid == true }) !== undefined;

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

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  const CustomTabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  const changeTab = (event: React.SyntheticEvent, newValue: number) => {
    switch (newValue) {
      case 1:
        getAOSConfig();
        break;
      case 2:
        getAOSStatus();
        break;
    }

    setSelectedTab(newValue);
  }

  const getAOSConfig = async () => {
    if (!areStationsAddedAndSelected) return;
    setAOSConfig(await apiInterface.getConfig({ ...selectedStation }));
  }

  const getAOSStatus = async () => {
    if (!areStationsAddedAndSelected) return;
    setAOSStatus(await apiInterface.getStatus({ ...selectedStation }));
  }

  React.useEffect(() => {
    if (AirOSTokens.length > 0 && selectedStation.station_ip === '') {
      changeSelectedStation({ target: { value: AirOSTokens[0].station_ip } } as SelectChangeEvent);
    }
  }, [AirOSTokens, changeSelectedStation, selectedStation.station_ip]);

  React.useEffect(() => {
    const authDataHandler = new AuthDataHandler(ctx);
    const json = authDataHandler.GetAuthResponseByIP(selectedStation.station_ip);
    if (json) setAuthResponse(json);
  }, [ctx, selectedStation.station_ip]);

  return (
    <Box>
      <Stack direction="row" spacing={1}>
        {areStationsAddedAndSelected &&

          <Select
            value={selectedStation.station_ip}
            onChange={changeSelectedStation}
          >
            {drawMenuItems}
          </Select>
        }

        <Button variant='outlined' onClick={() => setAuthFormOpen(true)}>Login to Station</Button>

      </Stack>

      {areStationsAddedAndSelected && <> {/* HIDDEN UNLESS SELECTED A STATION */}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop: 1 }}>
          <Tabs variant="fullWidth" value={selectedTab} onChange={changeTab} aria-label="basic tabs example">
            <Tab label="View Auth Info" />
            <Tab label="View Current Config" />
            <Tab label="View Current Status" />
          </Tabs>
        </Box>
        <CustomTabPanel value={selectedTab} index={0}>
          {authResponse && <RecordViewTable DisplayRecord={authResponse.json.boardinfo} />}
        </CustomTabPanel>
        <CustomTabPanel value={selectedTab} index={1}>
          {AOSConfig ? <RecordViewTable DisplayRecord={AOSConfig} /> : <Typography>Collecting data, please wait...</Typography>}
        </CustomTabPanel>
        <CustomTabPanel value={selectedTab} index={2}>
          {AOSStatus ? <JsonObjectViewTree json={AOSStatus} /> : <Typography>Collecting data, please wait...</Typography>}
        </CustomTabPanel>

      </> /* END OF HIDDEN UNLESS SELECTED STATION */}

      <StationAuthForm open={authFormOpen} setOpen={setAuthFormOpen} />
    </Box>
  );
}
