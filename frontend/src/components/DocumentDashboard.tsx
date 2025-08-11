import React, { useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
} from '@mui/material';
import { DocumentType, DOCUMENT_TYPES } from '../types/documentTypes';
import DescriptionIcon from '@mui/icons-material/Description';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ChecklistIcon from '@mui/icons-material/Checklist';

const DocumentDashboard: React.FC = () => {
    const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [purpose, setPurpose] = useState('');

    const handleRequestDocument = (document: DocumentType) => {
        setSelectedDocument(document);
        setIsDialogOpen(true);
    };

    const handleSubmitRequest = () => {
        // TODO: Implement API call to submit request
        console.log('Submitting request for:', selectedDocument?.name);
        console.log('Purpose:', purpose);
        setIsDialogOpen(false);
        setPurpose('');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
                Document Request Dashboard
            </Typography>

            <Grid container spacing={3}>
                {DOCUMENT_TYPES.map((document) => (
                    <Grid item xs={12} sm={6} md={4} key={document.id}>
                        <Card 
                            sx={{ 
                                height: '100%', 
                                display: 'flex', 
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 3,
                                }
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" component="h2" gutterBottom>
                                    {document.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {document.description}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <AccessTimeIcon sx={{ mr: 1, fontSize: 20 }} />
                                        Processing Time: {document.processingTime}
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    onClick={() => handleRequestDocument(document)}
                                    sx={{ mt: 2 }}
                                >
                                    Request Document
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Request {selectedDocument?.name}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                            Requirements:
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                            <List dense>
                                {selectedDocument?.requirements?.map((req, index) => (
                                    <ListItem key={index}>
                                        <ListItemIcon>
                                            <ChecklistIcon />
                                        </ListItemIcon>
                                        <ListItemText primary={req} />
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Purpose of Request"
                            fullWidth
                            multiline
                            rows={4}
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            variant="outlined"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button 
                        onClick={handleSubmitRequest} 
                        variant="contained"
                        disabled={!purpose.trim()}
                    >
                        Submit Request
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DocumentDashboard; 