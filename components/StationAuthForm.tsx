import { AirOSAuthContext, AirOSAuthentication } from "@/src/AirOSLib";
import { PostAuthParamsType } from "@/src/dto/Authentication.dto";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, TextField } from "@mui/material";
import React from "react";


interface StationAuthFormProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function StationAuthForm({ open, setOpen }: StationAuthFormProps) {
    const ctx = React.useContext(AirOSAuthContext);

    const submitAuth = async (data: PostAuthParamsType) => {
        setOpen(false);

        await (new AirOSAuthentication(ctx)).PostAuth(data);
    }

    return (
        <Dialog
            open={open}
            PaperProps={{
                component: 'form',
                onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const formJson = Object.fromEntries((formData as any).entries());
                    const [username, password, station_ip] = [formJson.username, formJson.password, formJson.station_ip];
                    submitAuth({ username, password, station_ip });
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
    )
}