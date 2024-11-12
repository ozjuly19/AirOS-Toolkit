'use client'

import { AirOSAuthContext } from "@/src/AirOSLib";
import { Card, CardContent, Paper, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import React from "react";

export default function CurrentAuthEntries() {
  const { AirOSTokens } = React.useContext(AirOSAuthContext);

  return (
    <Card>
      <CardContent>
        <Typography variant='h5'>Current Auth Tokens</Typography>

        <Paper sx={{ height: 400, width: '100%', marginTop: 1 }}>
          <DataGrid
            rows={AirOSTokens.map((entry) => {
              return {
                id: entry.station_ip,
                station_ip: entry.station_ip,
                auth_token: entry.auth_token,
                isValid: entry.isValid ? 'Current' : 'Expired'
              };
            }
            )}

            columns={[
              { field: 'station_ip', headerName: 'IP', flex: 1, maxWidth: 150 },
              { field: 'auth_token', headerName: 'TOKEN', flex: 1 },
              { field: 'isValid', headerName: 'STATUS', flex: 1 }
            ]}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            sx={{ border: 0 }}
          />
        </Paper>
      </CardContent>
    </Card>
  );
}