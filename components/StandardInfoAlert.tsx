'use client'

import React from 'react';
import { Collapse, Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface StandardInfoAlertProps {
    alertText: string;
    alertType: 'info' | 'warning' | 'error' | 'success';
}

export default function StandardInfoAlert(props: StandardInfoAlertProps) {
    const { alertText, alertType } = props;
    const [alertVis, setAlertVis] = React.useState(false);

    React.useEffect(() => {
        if (alertText) {
            setAlertVis(true);
        }
    }, [alertText, alertType]);

    return (
        <Collapse in={alertVis}>
            <Alert
                severity={alertType}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={() => {
                            setAlertVis(false);
                        }}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
                sx={{ mb: 2 }}
            >
                {alertText}
            </Alert>
        </Collapse>
    );
}