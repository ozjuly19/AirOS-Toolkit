'use client'

import { Box, MenuItem, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { AuthSuccessReturn, AuthSuccessReturnType } from "@/src/dto/Authentication.dto";
import React, { useEffect } from "react";

export function AuthDataTabs({ AuthReturnJson }: { AuthReturnJson: AuthSuccessReturnType }) {
    // Seperate the authJson.boardinfo into multiple arrays
    // Each array will be seperated by the first part of the key
    // E.g. radio.1.freq => radio.1 => Radio 1

    let boardinfo: Record<string, string> = {};

    if (typeof AuthReturnJson.boardinfo !== 'string')
        boardinfo = AuthReturnJson.boardinfo;
    else {
        boardinfo = AuthSuccessReturn.parse(AuthReturnJson).boardinfo;
    }

    const arrayOfSubjects = Object.entries(boardinfo).reduce((acc, [key, value]) => {
        const [subject] = key.split('.');

        if (!acc[subject]) {
            acc[subject] = [];
        }

        acc[subject].push({ key, value });

        return acc;
    }, {} as Record<string, { key: string, value: string }[]>);

    const [selectedTable, setSelectedTable] = React.useState<string>("");

    useEffect(() => {
        if (selectedTable === "")
            setSelectedTable(Object.keys(arrayOfSubjects)[0]);
    }, [arrayOfSubjects, selectedTable]);

    const changeTable = (event: SelectChangeEvent) => {
        console.log(event.target.value);
        if (typeof event.target.value !== 'undefined')
            setSelectedTable(event.target.value);
    }

    return (
        <Box>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Select Table Subject"
                value={selectedTable}
                onChange={changeTable}
            >
                {Object.keys(arrayOfSubjects).map((subject) => (
                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                ))}
            </Select>
            {!arrayOfSubjects[selectedTable] ? null :
                <TableContainer sx={{ marginTop: 1 }}>
                    <Table sx={{ minWidth: 650 }} size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Key</TableCell>
                                <TableCell align='right'>Value</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {arrayOfSubjects[selectedTable] && arrayOfSubjects[selectedTable].map(({ key, value }) => (
                                <TableRow key={key}>
                                    <TableCell>{key}</TableCell>
                                    <TableCell align='right'>{value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
        </Box>
    )
}
