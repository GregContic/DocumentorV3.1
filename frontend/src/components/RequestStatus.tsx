import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { DocumentRequest } from '../types/documentTypes';

interface RequestStatusProps {
    requests: DocumentRequest[];
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'pending':
            return 'warning';
        case 'processing':
            return 'info';
        case 'completed':
            return 'success';
        case 'rejected':
            return 'error';
        default:
            return 'default';
    }
};

const RequestStatus: React.FC<RequestStatusProps> = ({ requests }) => {
    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                My Document Requests
            </Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Document Type</TableCell>
                            <TableCell>Request Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Expected Completion</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((request) => (
                            <TableRow key={request.id}>
                                <TableCell>{request.documentType}</TableCell>
                                <TableCell>
                                    {new Date(request.requestDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                        color={getStatusColor(request.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    {request.completionDate
                                        ? new Date(request.completionDate).toLocaleDateString()
                                        : 'Processing'}
                                </TableCell>
                                <TableCell>
                                    <Tooltip title="View Details">
                                        <IconButton size="small">
                                            <InfoIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        No document requests found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default RequestStatus; 