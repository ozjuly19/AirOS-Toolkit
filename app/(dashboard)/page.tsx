'use client'

import * as React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  TextField,
} from '@mui/material';

import { apiAuth } from '@/components/GetDataAirOS';
import StandardInfoAlert from '@/components/StandardInfoAlert';
import { AuthDataTabs } from '@/components/AuthDataTabs';
import { AuthReturnType } from '@/types/AirOSApi';
import { GlobalContext } from '@/app/layout';

export default function HomePage() {
  const [open, setOpen] = React.useState(true);
  const [authJson, setAuthJson] = React.useState<AuthReturnType>();
  const [alertType, setAlertType] = React.useState<'info' | 'warning' | 'error' | 'success'>('info');
  const [alertText, setAlertText] = React.useState('');

  const { authJWT, setAuthJWT } = React.useContext(GlobalContext);

  const submitAuth = async (username: string, password: string, station_ip: string) => {
    setOpen(false);

    try {
      const resp = await apiAuth(username, password, station_ip);
      setAlertText(resp.status + '\n' + resp.AIROS_AUTH);
      setAlertType('success');
      setAuthJson(resp.json);
      setAuthJWT(resp.AIROS_AUTH);
    } catch (error) {
      if (error instanceof Error) {
        setAlertText(error.message);
      } else {
        setAlertText(String(error));
      }
      setAlertType('error');
    }
  }

  React.useEffect(() => {
    if (authJWT) {
      setAlertText('Authenticated to station');
      setAlertType('success');
    } else {
      setAlertText('Not authenticated to station');
      setAlertType('warning');
    }
  }, [setAlertText, setAlertType, authJWT]);

  return (
    <Box>
      {authJWT ? null :
        <Dialog
          open={open}
          PaperProps={{
            component: 'form',
            onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const formJson = Object.fromEntries((formData as any).entries());
              submitAuth(formJson.username, formJson.password, formJson.station_ip);
            }
          }}
        >
          <DialogContent>
            <DialogContentText>
              To perform config edits and such you must login to your choice station.
            </DialogContentText>
            <TextField
              name='station_ip'
              label='Station IPv4'
              required
              autoFocus
              fullWidth
              margin='dense'
              variant='standard'
            />
            <TextField
              name='username'
              label='Station Username'
              required
              autoFocus
              fullWidth
              margin='dense'
              variant='standard'
            />
            <TextField
              name='password'
              type='password'
              label='Station Password'
              required
              autoFocus
              fullWidth
              margin='dense'
              variant='standard'
            />
          </DialogContent>
          <DialogActions>
            <Button type='submit'>Submit</Button>
          </DialogActions>
        </Dialog>
      }
      <StandardInfoAlert alertText={alertText} alertType={alertType} />


      {!authJson ? null :
        <AuthDataTabs AuthReturnJson={authJson} />
      }
    </Box>
  );
}
