import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  Fade,
  Slide,
  useTheme,
  Avatar,
  Stack,
  Badge,
} from '@mui/material';
import {
  Restore as RestoreIcon,
  Info as InfoIcon,
  Archive as ArchiveIcon,
  Description as DocumentIcon,
  QuestionAnswer as InquiryIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Message as MessageIcon,
  Reply as ReplyIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { documentService, inquiryService } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const Archive = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  
  // Document Archive State
  const [archivedDocuments, setArchivedDocuments] = useState([]);
  const [documentPage, setDocumentPage] = useState(0);
  const [documentRowsPerPage, setDocumentRowsPerPage] = useState(10);
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  const [documentLoading, setDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState('');
  
  // Inquiry Archive State
  const [archivedInquiries, setArchivedInquiries] = useState([]);
  const [inquiryPage, setInquiryPage] = useState(0);
  const [inquiryRowsPerPage, setInquiryRowsPerPage] = useState(10);
  const [inquirySearchTerm, setInquirySearchTerm] = useState('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState('');

  // Dialog state
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 0) {
      fetchArchivedDocuments();
    } else {
      fetchArchivedInquiries();
    }
  }, [activeTab]);  const fetchArchivedDocuments = async () => {
    try {
      setDocumentLoading(true);
      setDocumentError('');
      console.log('Fetching archived documents...');
      const response = await documentService.getArchivedDocuments();
      console.log('Document response:', response);
      setArchivedDocuments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching archived documents:', error);
      setDocumentError(
        error.response?.data?.message || 
        error.message || 
        'Failed to load archived documents. Please ensure the server is running.'
      );
    } finally {
      setDocumentLoading(false);
    }
  };

  const fetchArchivedInquiries = async () => {
    try {
      setInquiryLoading(true);
      setInquiryError('');
      console.log('Fetching archived inquiries...');
      const response = await inquiryService.getArchivedInquiries();
      console.log('Inquiry response:', response);
      setArchivedInquiries(response.data.data || []);
    } catch (error) {
      console.error('Error fetching archived inquiries:', error);
      setInquiryError(
        error.response?.data?.message || 
        error.message || 
        'Failed to load archived inquiries. Please ensure the server is running.'
      );
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleRestoreDocument = async (documentId) => {
    try {
      await documentService.restoreDocument(documentId);
      fetchArchivedDocuments();
    } catch (error) {
      console.error('Error restoring document:', error);
    }
  };

  const handleRestoreInquiry = async (inquiryId) => {
    try {
      await inquiryService.restoreInquiry(inquiryId);
      fetchArchivedInquiries();
    } catch (error) {
      console.error('Error restoring inquiry:', error);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };  const handleBulkArchiveCompleted = async () => {
    try {
      setInquiryLoading(true);
      const response = await inquiryService.bulkArchiveCompletedInquiries();
      
      if (response.data.success) {
        alert(`Successfully archived ${response.data.archivedCount} completed inquiries!`);
        // Refresh the inquiry list if we're on the inquiry tab
        if (activeTab === 1) {
          fetchArchivedInquiries();
        }
      }
    } catch (error) {
      console.error('Error bulk archiving completed inquiries:', error);
      setInquiryError('Failed to archive completed inquiries: ' + (error.response?.data?.message || error.message));
    } finally {
      setInquiryLoading(false);
    }
  };

  const handleBulkArchiveCompletedDocuments = async () => {
    try {
      setDocumentLoading(true);
      const response = await documentService.bulkArchiveCompletedRequests();
      
      if (response.data.success) {
        alert(`Successfully archived ${response.data.archivedCount} completed document requests!`);
        // Refresh the document list if we're on the documents tab
        if (activeTab === 0) {
          fetchArchivedDocuments();
        }
      }
    } catch (error) {
      console.error('Error bulk archiving completed documents:', error);
      setDocumentError('Failed to archive completed documents: ' + (error.response?.data?.message || error.message));
    } finally {
      setDocumentLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  // Filter functions
  const filteredDocuments = archivedDocuments.filter(doc => {
    const studentName = doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : '';
    return studentName.toLowerCase().includes(documentSearchTerm.toLowerCase()) ||
           (doc.documentType || '').toLowerCase().includes(documentSearchTerm.toLowerCase()) ||
           (doc._id || '').toLowerCase().includes(documentSearchTerm.toLowerCase());
  });

  const filteredInquiries = archivedInquiries.filter(inquiry => {
    const studentName = inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : '';
    const email = inquiry.user ? inquiry.user.email : '';
    return studentName.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
           email.toLowerCase().includes(inquirySearchTerm.toLowerCase()) ||
           (inquiry.message || '').toLowerCase().includes(inquirySearchTerm.toLowerCase());
  });
  const renderDocumentTable = () => (
    <Fade in timeout={300}>
      <Paper 
        sx={{ 
          width: '100%', 
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >        <Box sx={{ 
          p: 3, 
          backgroundColor: 'primary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <DocumentIcon />
            </Avatar>
            <Typography variant="h6" fontWeight="600">
              Archived Document Requests
            </Typography>
            <Badge 
              badgeContent={filteredDocuments.length} 
              color="secondary"
              sx={{ ml: 'auto' }}
            />
          </Box>
          <TextField
            fullWidth
            placeholder="Search by student name, document type, or ID..."
            value={documentSearchTerm}
            onChange={(e) => setDocumentSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid rgba(255,255,255,0.3)',
                },
                '& input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        </Box>
        
        {documentLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : documentError ? (
          <Alert 
            severity="error" 
            sx={{ 
              m: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
          >
            {documentError}
          </Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Request ID
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Student Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Document Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Archived Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDocuments
                    .slice(documentPage * documentRowsPerPage, documentPage * documentRowsPerPage + documentRowsPerPage)
                    .map((doc, index) => {
                      const studentName = doc.user ? `${doc.user.firstName} ${doc.user.lastName}` : 'N/A';
                      return (
                        <TableRow 
                          key={doc._id} 
                          hover
                          sx={{
                            '&:hover': {
                              bgcolor: 'rgba(103, 126, 234, 0.04)',
                              transform: 'scale(1.001)',
                              transition: 'all 0.2s ease-in-out',
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: 'rgba(0,0,0,0.02)',
                            },
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Chip
                              label={doc._id.slice(-8)}
                              size="small"
                              variant="outlined"
                              sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                {studentName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {studentName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {doc.documentType}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={doc.status} 
                              color={doc.status === 'completed' ? 'success' : 'default'}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                borderRadius: 2,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {new Date(doc.archivedAt || doc.updatedAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details" arrow>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<ViewIcon />}                                  onClick={() => handleViewDetails(doc)}
                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    backgroundColor: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: 'primary.dark',
                                      transform: 'translateY(-1px)',
                                      boxShadow: 3,
                                    },
                                  }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                              <Tooltip title="Restore Document" arrow>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRestoreDocument(doc._id)}
                                  sx={{
                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                    color: '#4caf50',
                                    '&:hover': {
                                      bgcolor: 'rgba(76, 175, 80, 0.2)',
                                      transform: 'translateY(-1px)',
                                    },
                                  }}
                                >
                                  <RestoreIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredDocuments.length}
              rowsPerPage={documentRowsPerPage}
              page={documentPage}
              onPageChange={(event, newPage) => setDocumentPage(newPage)}
              onRowsPerPageChange={(event) => {
                setDocumentRowsPerPage(parseInt(event.target.value, 10));
                setDocumentPage(0);
              }}
              sx={{
                borderTop: '1px solid rgba(0,0,0,0.1)',
                bgcolor: '#f8fafc',
              }}
            />
          </>
        )}
      </Paper>
    </Fade>
  );
  const renderInquiryTable = () => (
    <Fade in timeout={300}>
      <Paper 
        sx={{ 
          width: '100%', 
          overflow: 'hidden',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}
      >        <Box sx={{ 
          p: 3, 
          backgroundColor: 'secondary.main',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <InquiryIcon />
            </Avatar>
            <Typography variant="h6" fontWeight="600">
              Archived Inquiries
            </Typography>
            <Badge 
              badgeContent={filteredInquiries.length} 
              color="secondary"
              sx={{ ml: 'auto' }}
            />
          </Box>
          <TextField
            fullWidth
            placeholder="Search by student name, email, or message..."
            value={inquirySearchTerm}
            onChange={(e) => setInquirySearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'rgba(255,255,255,0.15)',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  border: '2px solid rgba(255,255,255,0.3)',
                },
                '& input': {
                  color: 'white',
                  '&::placeholder': {
                    color: 'rgba(255,255,255,0.7)',
                    opacity: 1,
                  },
                },
              },
            }}
          />
        </Box>
      
        {inquiryLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : inquiryError ? (
          <Alert 
            severity="error" 
            sx={{ 
              m: 3, 
              borderRadius: 2,
              '& .MuiAlert-icon': { fontSize: 28 }
            }}
          >
            {inquiryError}
          </Alert>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Student Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Message Preview
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Archived Date
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, bgcolor: '#f8fafc', py: 2 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredInquiries
                    .slice(inquiryPage * inquiryRowsPerPage, inquiryPage * inquiryRowsPerPage + inquiryRowsPerPage)
                    .map((inquiry, index) => {
                      const studentName = inquiry.user ? `${inquiry.user.firstName} ${inquiry.user.lastName}` : 'N/A';
                      const email = inquiry.user ? inquiry.user.email : 'N/A';
                      return (
                        <TableRow 
                          key={inquiry._id} 
                          hover
                          sx={{
                            '&:hover': {
                              bgcolor: 'rgba(240, 147, 251, 0.04)',
                              transform: 'scale(1.001)',
                              transition: 'all 0.2s ease-in-out',
                            },
                            '&:nth-of-type(even)': {
                              bgcolor: 'rgba(0,0,0,0.02)',
                            },
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                                {studentName.charAt(0)}
                              </Avatar>
                              <Typography variant="body2" fontWeight={500}>
                                {studentName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2, maxWidth: 300 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <MessageIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography 
                                variant="body2" 
                                noWrap
                                sx={{ 
                                  bgcolor: 'rgba(0,0,0,0.04)',
                                  px: 1,
                                  py: 0.5,
                                  borderRadius: 1,
                                  fontStyle: 'italic',
                                }}
                              >
                                {inquiry.message}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={inquiry.status} 
                              color={inquiry.status === 'archived' ? 'info' : 'default'}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                borderRadius: 2,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {new Date(inquiry.archivedAt || inquiry.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="View Details" arrow>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<ViewIcon />}
                                  onClick={() => handleViewDetails(inquiry)}                                  sx={{ 
                                    minWidth: 'auto',
                                    px: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    backgroundColor: 'secondary.main',
                                    '&:hover': {
                                      backgroundColor: 'secondary.dark',
                                      transform: 'translateY(-1px)',
                                      boxShadow: 3,
                                    },
                                  }}
                                >
                                  View
                                </Button>
                              </Tooltip>
                              <Tooltip title="Restore Inquiry" arrow>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleRestoreInquiry(inquiry._id)}
                                  sx={{
                                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                                    color: '#4caf50',
                                    '&:hover': {
                                      bgcolor: 'rgba(76, 175, 80, 0.2)',
                                      transform: 'translateY(-1px)',
                                    },
                                  }}
                                >
                                  <RestoreIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredInquiries.length}
              rowsPerPage={inquiryRowsPerPage}
              page={inquiryPage}
              onPageChange={(event, newPage) => setInquiryPage(newPage)}
              onRowsPerPageChange={(event) => {
                setInquiryRowsPerPage(parseInt(event.target.value, 10));
                setInquiryPage(0);
              }}
              sx={{
                borderTop: '1px solid rgba(0,0,0,0.1)',
                bgcolor: '#f8fafc',
              }}
            />
          </>
        )}
      </Paper>
    </Fade>
  );  const renderDetailsDialog = () => (
    <Dialog 
      open={dialogOpen} 
      onClose={handleCloseDialog} 
      maxWidth="lg" 
      fullWidth
      TransitionComponent={Slide}
      TransitionProps={{ direction: "up" }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }
      }}
    >      <DialogTitle 
        sx={{ 
          backgroundColor: activeTab === 0 ? 'primary.main' : 'secondary.main',
          color: 'white',
          py: 3,
          px: 4,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
            {activeTab === 0 ? <DocumentIcon /> : <InquiryIcon />}
          </Avatar>
          <Typography variant="h5" fontWeight="600">
            {activeTab === 0 ? 'Document Request Details' : 'Inquiry Details'}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {selectedItem && (
          <Box sx={{ p: 4 }}>
            {activeTab === 0 ? (
              // Enhanced Document details
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                    Request Information
                  </Typography>
                  <Divider sx={{ mb: 3 }} />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Request ID
                    </Typography>
                    <Chip
                      label={selectedItem.requestId || selectedItem._id}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Student Name
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body1" fontWeight={500}>
                        {selectedItem.studentName || 
                         (selectedItem.user ? `${selectedItem.user.firstName} ${selectedItem.user.lastName}` : 'N/A')}
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Document Type
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedItem.documentType}
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Status
                    </Typography>
                    <Chip 
                      label={selectedItem.status} 
                      color={selectedItem.status === 'completed' ? 'success' : 'default'} 
                      sx={{ fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: '#fff7ed', border: '1px solid #fed7aa' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Purpose
                    </Typography>
                    <Typography variant="body1">
                      {selectedItem.purpose || 'Not specified'}
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: '#f0f9ff', border: '1px solid #bae6fd' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Comments
                    </Typography>
                    <Typography variant="body1">
                      {selectedItem.comments || 'No comments'}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              // Enhanced Inquiry details
              <Grid container spacing={3}>
                {/* Header Section */}
                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: '#fef3f2', border: '1px solid #fecaca' }}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ fontWeight: 600 }}>
                      Inquiry Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                              Student Name
                            </Typography>
                            <Typography variant="body1" fontWeight={600}>
                              {selectedItem.user ? `${selectedItem.user.firstName} ${selectedItem.user.lastName}` : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}>
                            <EmailIcon />
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" color="textSecondary">
                              Email Address
                            </Typography>
                            <Typography variant="body1" fontWeight={500}>
                              {selectedItem.user ? selectedItem.user.email : 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
                
                {/* Status and Dates */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Inquiry ID
                    </Typography>
                    <Chip
                      label={selectedItem._id}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                      Status
                    </Typography>
                    <Chip 
                      label={selectedItem.status} 
                      color={selectedItem.status === 'archived' ? 'info' : 'default'}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Submitted Date
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {new Date(selectedItem.createdAt).toLocaleString()}
                    </Typography>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ArchiveIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="subtitle2" color="textSecondary">
                        Archived Date
                      </Typography>
                    </Box>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedItem.archivedAt ? new Date(selectedItem.archivedAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </Card>
                </Grid>
                
                {selectedItem.resolvedAt && (
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                        <Typography variant="subtitle2" color="textSecondary">
                          Resolved Date
                        </Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(selectedItem.resolvedAt).toLocaleString()}
                      </Typography>
                    </Card>
                  </Grid>
                )}
                
                {selectedItem.resolvedBy && (
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                        Resolved By
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {selectedItem.resolvedBy}
                      </Typography>
                    </Card>
                  </Grid>
                )}
                
                {/* Message Section */}
                <Grid item xs={12}>
                  <Card sx={{ p: 3, bgcolor: '#fffbeb', border: '1px solid #fed7aa' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <MessageIcon sx={{ color: 'warning.main' }} />
                      <Typography variant="h6" color="primary" fontWeight={600}>
                        Original Message
                      </Typography>
                    </Box>
                    <Paper sx={{ p: 3, bgcolor: 'white', borderRadius: 2, border: '1px solid #e5e7eb' }}>
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {selectedItem.message}
                      </Typography>
                    </Paper>
                  </Card>
                </Grid>
                
                {/* Replies Section */}
                {selectedItem.replies && selectedItem.replies.length > 0 && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 3, bgcolor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                        <ReplyIcon sx={{ color: 'info.main' }} />
                        <Typography variant="h6" color="primary" fontWeight={600}>
                          Response History
                        </Typography>
                        <Chip 
                          label={`${selectedItem.replies.length} ${selectedItem.replies.length === 1 ? 'reply' : 'replies'}`}
                          size="small"
                          color="info"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      <Stack spacing={2}>
                        {selectedItem.replies.map((reply, index) => (
                          <Paper 
                            key={index} 
                            sx={{ 
                              p: 3, 
                              bgcolor: 'white',
                              borderRadius: 2,
                              border: '1px solid #e5e7eb',
                              position: 'relative',
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              mb: 2,
                              pb: 1,
                              borderBottom: '1px solid #f3f4f6'
                            }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ width: 28, height: 28, bgcolor: 'info.main', fontSize: 14 }}>
                                  {(reply.repliedBy || 'Admin').charAt(0)}
                                </Avatar>
                                <Typography variant="subtitle1" fontWeight={600} color="primary">
                                  {reply.repliedBy || 'Admin'}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="caption" color="textSecondary" fontWeight={500}>
                                  {new Date(reply.date).toLocaleString()}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                              {reply.message}
                            </Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <Button 
          onClick={handleCloseDialog}
          variant="contained"
          sx={{ 
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
  return (
    <AdminLayout title="Archive Dashboard">
      <Container maxWidth="xl">
        {/* Header Section */}
        <Fade in timeout={600}>
          <Card 
            sx={{
              mb: 4, 
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: 4,
              boxShadow: 3,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ 
                  mr: 3, 
                width: 56, 
                height: 56, 
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: 28 
              }}>
                <ArchiveIcon />
              </Avatar>
              <Box>
                <Typography variant="h3" component="h1" fontWeight="700" gutterBottom>
                  Archive Center
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Manage and view all archived documents and inquiries
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Navigation and Bulk Actions */}
      <Fade in timeout={800}>
        <Card sx={{ 
          mb: 4, 
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
        }}>
        </Card>
      </Fade>

      {/* Table Content */}
      {activeTab === 0 ? renderDocumentTable() : renderInquiryTable()}
      {renderDetailsDialog()}
      </Container>
    </AdminLayout>
  );
};

export default Archive;
