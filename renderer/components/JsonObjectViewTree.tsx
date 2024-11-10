'use client'

import React from 'react';
import Box from '@mui/material/Box';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';
import { RichTreeView } from '@mui/x-tree-view/RichTreeView';

interface JsonObjectViewTreeProps {
    json: Record<string, any>;
}

const convertJsonToTree = (obj: Record<string, any>, parentId: string = ''): TreeViewBaseItem[] => {
    return Object.keys(obj).map((key, index) => {
        const id = parentId ? `${parentId}-${index}` : `${index}`;
        const value = obj[key];
        const children = typeof value === 'object' && value !== null ? convertJsonToTree(value, id) : [];

        return {
            id,
            label: `${key}: ${typeof value === 'object' && value !== null ? '' : value}`,
            children: children.length > 0 ? children : undefined,
        };
    });
};

export default function JsonObjectViewTree({ json }: JsonObjectViewTreeProps) {
    // Convert the raw json into a tree view
    const items: TreeViewBaseItem[] = convertJsonToTree(json);

    return (
        <Box sx={{ marginTop: 1 }}>
            <RichTreeView items={items} />
        </Box>
    );
}