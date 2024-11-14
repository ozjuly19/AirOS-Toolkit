'use client'

import { AirOSAuthContext } from "@/src/AirOSApi.lib";
import { CredentialStoreType } from "@/src/dto/Authentication.dto";
import { Box, Button } from "@mui/material"
import { DataGrid, GridRowModel } from "@mui/x-data-grid"
import React from "react";

export default function CredManagerPage() {
  const { CredentialStore, setCredentialStore } = React.useContext(AirOSAuthContext);

  const processRowUpdate = (newRow: GridRowModel) => {
    const newCredStore = CredentialStore[newRow.id - 1] = { ...newRow, order: newRow.id } as CredentialStoreType;

    setCredentialStore([...CredentialStore.slice(0, newRow.id - 1), newCredStore, ...CredentialStore.slice(newRow.id)]);

    return { ...newRow, isNew: false };
  }

  return (
    <Box>
      <Button
        variant='outlined'
        onClick={() => {
          setCredentialStore(
            [...CredentialStore, {
              order: CredentialStore.length + 1,
              username: 'ubnt',
              password: 'ubnt'
            }]
          );
        }}
        sx={{ margin: 1 }}
      >
        Add Credential Pair
      </Button>

      <DataGrid
        rows={CredentialStore.map((entry) => {
          return {
            ...entry,
            id: entry.order,
          };
        })}
        editMode="row"
        columns={[
          { field: 'id', headerName: 'Use order', flex: 1 },
          { field: 'username', headerName: 'Username', flex: 1, editable: true },
          { field: 'password', headerName: 'Password', flex: 1, editable: true }
        ]}
        initialState={{ pagination: { paginationModel: { page: 0, pageSize: 5 } } }}
        pageSizeOptions={[5, 10]}
        checkboxSelection={false}
        processRowUpdate={processRowUpdate}
        sx={{ border: 0, margin: 1 }}
      />
    </Box>
  )
}