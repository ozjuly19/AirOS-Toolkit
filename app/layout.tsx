'use client'

import * as React from 'react';
import { AppProvider } from '@toolpad/core/nextjs';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import LoginIcon from '@mui/icons-material/Login';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import type { Navigation } from '@toolpad/core/AppProvider';

import theme from '../theme';

const NAVIGATION: Navigation = [
  {
    kind: 'header',
    title: 'Tools',
  },
  {
    segment: '',
    title: 'Station Login',
    icon: <LoginIcon />,
  },
  // {
  //   segment: 'orders',
  //   title: 'Orders',
  //   icon: <ShoppingCartIcon />,
  // },
];

const BRANDING = {
  title: 'AirOS Toolkit',
};

export const GlobalContext = React.createContext<any>(null);

export default function RootLayout(props: { children: React.ReactNode }) {
  const [authJWT, setAuthJWT] = React.useState<string | null>(null);

  return (
    <html lang="en" data-toolpad-color-scheme="light" suppressHydrationWarning>
      <body>

        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AppProvider
            navigation={NAVIGATION}
            branding={BRANDING}

            theme={theme}
          >
            <GlobalContext.Provider value={{ authJWT, setAuthJWT }}>
              {props.children}
            </GlobalContext.Provider>
          </AppProvider>
        </AppRouterCacheProvider>

      </body>
    </html>
  );
}
