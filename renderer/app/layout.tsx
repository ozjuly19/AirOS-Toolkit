'use client'

import React from 'react';
import { AppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';


import LoginIcon from '@mui/icons-material/Login';
import DescriptionIcon from '@mui/icons-material/Description';
import LanIcon from '@mui/icons-material/Lan'; import type { Navigation } from '@toolpad/core/AppProvider';
import CableIcon from '@mui/icons-material/Cable';

import theme from '@/theme';
import { AuthTokenStoreType, CredentialStoreType, PostAuthReturnType } from '@/src/dto/Authentication.dto';
import { AirOSAuthContext } from '@/src/AirOSApi.lib';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Navigation',
  },
  {
    segment: 'stations',
    title: 'Stations',
    icon: <LanIcon />,
    children: [
      {
        segment: 'credentialManager/',
        title: 'Credential Manager',
        icon: <LoginIcon />,
      },
      {
        segment: 'connectionManager/',
        title: 'Connection Manager',
        icon: <CableIcon />,
      },
      {
        segment: 'currentAuthEntries/',
        title: 'Auth Tokens',
        icon: <DescriptionIcon />,
      },
    ],
  },
];

const BRANDING = {
  title: 'AirOS Toolkit',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const [AirOSTokens, setAirOSTokens] = React.useState<AuthTokenStoreType[]>([]);
  const [AuthResponses, setAuthResponses] = React.useState<PostAuthReturnType[]>([]);
  const [CredentialStore, setCredentialStore] = React.useState<CredentialStoreType[]>([]);

  return (
    <html lang="en" data-toolpad-color-scheme="dark" suppressHydrationWarning>
      <body>
        <React.Suspense>
          <AppRouterCacheProvider options={{ enableCssLayer: true }}>
            <AppProvider
              navigation={NAVIGATION}
              branding={BRANDING}

              theme={theme}
            >
              <AirOSAuthContext.Provider value={
                {
                  AirOSTokens,
                  setAirOSTokens,
                  AuthResponses,
                  setAuthResponses,
                  CredentialStore,
                  setCredentialStore,
                }}>
                {props.children}
              </AirOSAuthContext.Provider>
              <ToastContainer theme={"dark"} position="bottom-left" />
            </AppProvider>
          </AppRouterCacheProvider>
        </React.Suspense>
      </body>
    </html>
  );
}
