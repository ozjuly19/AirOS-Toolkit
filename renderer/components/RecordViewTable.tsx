'use client'

import { Box, MenuItem, Select, SelectChangeEvent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import React, { useEffect } from "react";
import { StringToRecord } from "@/src/dto/Transformers";

export function RecordViewTable({ DisplayRecord }: { DisplayRecord: Record<string, string> }) {
    // Seperate the record into multiple arrays
    // Each array will be seperated by the first part of the key
    // E.g. radio.1.freq => radio => Radio

    // Create an object with the first part of the key as the key and the value as an array of objects
    const arrayOfSubjects = Object.entries(DisplayRecord).reduce((acc, [key, value]) => {
        let [subject] = key.split('.');

        // Capitalize the first letter of the subject
        subject = subject.charAt(0).toUpperCase() + subject.slice(1);

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
