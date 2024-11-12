import { AirOSAuthContext, ApiInterface, AuthDataHandler } from "@/src/AirOSLib";
import { PostAuthParamsType, PostAuthReturnType } from "@/src/dto/Authentication.dto";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, TextField } from "@mui/material";
import React from "react";
import { toast } from "react-toastify";


interface StationAuthFormProps {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function StationAuthForm({ open, setOpen }: StationAuthFormProps) {
    const ctx = React.useContext(AirOSAuthContext);

    const submitAuth = async (data: PostAuthParamsType) => {
        setOpen(false);

        let auth: PostAuthReturnType | undefined;

        try {
            auth = await (new ApiInterface(new AuthDataHandler(ctx))).returnAndStoreAuthToken(data);
        } catch (e) {
            toast.error('Failed to authenticate to ' + data.station_ip + '. ' + e);
            return
        }

        if (auth)
            toast.success('Successfully authenticated to ' + data.station_ip);
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
                <Button type='reset' onClick={() => setOpen(false)}>Cancel</Button>
                <Button type='submit'>Submit</Button>
            </DialogActions>
        </Dialog>
    )
}