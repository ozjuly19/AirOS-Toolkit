'use client'

import React from 'react';
import { AppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import LoginIcon from '@mui/icons-material/Login';
import ManagementIcon from '@mui/icons-material/ManageAccounts';
import DescriptionIcon from '@mui/icons-material/Description';
import type { Navigation } from '@toolpad/core/AppProvider';

import theme from '../theme';
import { AuthTokenStoreType, PostAuthReturnType } from '@/src/dto/Authentication.dto';
import { AirOSAuthContext } from '@/src/AirOSLib';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Navigation',
  },
  {
    segment: '',
    title: 'Tools',
    icon: <DescriptionIcon />,
  },
  {
    segment: 'management',
    title: 'Station Management',
    icon: <ManagementIcon />,
  },
  {
    segment: 'currentAuthEntries',
    title: 'Authenticated Stations',
    icon: <LoginIcon />,
  }
];

const BRANDING = {
  title: 'AirOS Toolkit',
};

export default function RootLayout(props: { children: React.ReactNode }) {
  const [AirOSTokens, setAirOSTokens] = React.useState<AuthTokenStoreType[]>([]);
  const [AuthResponses, setAuthResponses] = React.useState<PostAuthReturnType[]>([]);

  return (
    <html lang="en" data-toolpad-color-scheme="light" suppressHydrationWarning>
      <body>

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
                setAuthResponses
              }}>
              {props.children}
            </AirOSAuthContext.Provider>
          </AppProvider>
        </AppRouterCacheProvider>

      </body>
    </html>
  );
}
