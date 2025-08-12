import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  CheckBox as CheckBoxIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { documentService } from '../../services/api';

const EnhancedDocumentDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    documentType: '',
    priority: '',
    fromDate: null,
    toDate: null
  });
  
  // Dialog states
  const [bulkUpdateDialog, setBulkUpdateDialog] = useState(false);
  const [bulkUpdateData, setBulkUpdateData] = useState({
    status: '',
    rejectionReason: '',
    reviewNotes: ''
  });
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const statusColors = {
    'draft': 'default',
    'submitted': 'info',
    'pending': 'warning',
    'processing': 'primary',
    'approved': 'success',
    'rejected': 'error',
    'completed': 'success',
    'ready-for-pickup': 'secondary'
  };

  const priorityColors = {
    'low': 'default',
    'normal': 'primary',
    'high': 'warning',
    'urgent': 'error'
  };

  useEffect(() => {
    fetchRequests();
    fetchAnalytics();
  }, [page, rowsPerPage, filters]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
        fromDate: filters.fromDate?.toISOString(),
        toDate: filters.toDate?.toISOString()
      };
      
      const response = await documentService.getFilteredRequests(params);
      setRequests(response.data.data);
      setTotalCount(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await documentService.getDashboardAnalytics();
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleFilterChange = (field) => (value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0); // Reset to first page when filtering
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === requests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(requests.map(req => req._id));
    }
  };

  const handleBulkUpdate = async () => {
    try {
      await documentService.bulkUpdateRequests({
        requestIds: selectedRequests,
        ...bulkUpdateData
      });
      
      setBulkUpdateDialog(false);
      setSelectedRequests([]);
      fetchRequests();
      fetchAnalytics();
    } catch (error) {
      console.error('Error bulk updating requests:', error);
    }
  };

  const handleStatusUpdate = async (requestId, status, rejectionReason = '', reviewNotes = '') => {
    try {
      await documentService.updateRequestStatus(requestId, {
        status,
        rejectionReason,
        reviewNotes
      });
      
      fetchRequests();
      fetchAnalytics();
      setAnchorEl(null);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getProcessingProgress = (processingSteps) => {
    if (!processingSteps || processingSteps.length === 0) return 0;
    const completed = processingSteps.filter(step => step.status === 'completed').length;
    return (completed / processingSteps.length) * 100;
  };

  const renderAnalyticsCards = () => {
    if (!analytics) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">
                    {Object.values(analytics.statusCounts).reduce((a, b) => a + b, 0)}
                  </Typography>
                  <Typography color="text.secondary">Total Requests</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{analytics.statusCounts.pending || 0}</Typography>
                  <Typography color="text.secondary">Pending Review</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="error" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{analytics.overdueRequests}</Typography>
                  <Typography color="text.secondary">Overdue</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckBoxIcon color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography variant="h4">{analytics.statusCounts.completed || 0}</Typography>
                  <Typography color="text.secondary">Completed</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderFilters = () => (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        <FilterListIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        Filters
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status')(e.target.value)}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="submitted">Submitted</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Document Type</InputLabel>
            <Select
              value={filters.documentType}
              onChange={(e) => handleFilterChange('documentType')(e.target.value)}
              label="Document Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="form137">Form 137</MenuItem>
              <MenuItem value="form138">Form 138</MenuItem>
              <MenuItem value="goodMoral">Good Moral</MenuItem>
              <MenuItem value="diploma">Diploma</MenuItem>
              <MenuItem value="transcript">Transcript</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority')(e.target.value)}
              label="Priority"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <DatePicker
            label="From Date"
            value={filters.fromDate}
            onChange={handleFilterChange('fromDate')}
            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <DatePicker
            label="To Date"
            value={filters.toDate}
            onChange={handleFilterChange('toDate')}
            renderInput={(params) => <TextField {...params} size="small" fullWidth />}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={2}>
          <Button
            variant="outlined"
            onClick={() => setFilters({
              status: '',
              documentType: '',
              priority: '',
              fromDate: null,
              toDate: null
            })}
            fullWidth
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Enhanced Document Dashboard
      </Typography>
      
      {renderAnalyticsCards()}
      {renderFilters()}
      
      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <Alert 
          severity="info" 
          action={
            <Button 
              color="inherit" 
              size="small"
              onClick={() => setBulkUpdateDialog(true)}
            >
              Bulk Update ({selectedRequests.length})
            </Button>
          }
          sx={{ mb: 2 }}
        >
          {selectedRequests.length} request(s) selected
        </Alert>
      )}
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRequests.length > 0 && selectedRequests.length < requests.length}
                    checked={requests.length > 0 && selectedRequests.length === requests.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Requester</TableCell>
                <TableCell>Document Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Est. Completion</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRequests.includes(request._id)}
                        onChange={() => handleSelectRequest(request._id)}
                      />
                    </TableCell>
                    <TableCell>
                      {request.user?.firstName} {request.user?.lastName}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {request.user?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.documentType} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.status} 
                        color={statusColors[request.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={request.priority} 
                        color={priorityColors[request.priority]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: 100 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={getProcessingProgress(request.processingSteps)}
                          color="primary"
                        />
                        <Typography variant="caption">
                          {Math.round(getProcessingProgress(request.processingSteps))}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {request.estimatedCompletionDate ? (
                        <Typography variant="body2">
                          {new Date(request.estimatedCompletionDate).toLocaleDateString()}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedRequest(request);
                        }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
      
      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleStatusUpdate(selectedRequest?._id, 'approved')}>
          Approve
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(selectedRequest?._id, 'processing')}>
          Start Processing
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(selectedRequest?._id, 'completed')}>
          Mark Complete
        </MenuItem>
        <MenuItem onClick={() => handleStatusUpdate(selectedRequest?._id, 'rejected', 'Admin rejection')}>
          Reject
        </MenuItem>
      </Menu>
      
      {/* Bulk Update Dialog */}
      <Dialog open={bulkUpdateDialog} onClose={() => setBulkUpdateDialog(false)}>
        <DialogTitle>Bulk Update Requests</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
            <InputLabel>New Status</InputLabel>
            <Select
              value={bulkUpdateData.status}
              onChange={(e) => setBulkUpdateData(prev => ({ ...prev, status: e.target.value }))}
              label="New Status"
            >
              <MenuItem value="approved">Approved</MenuItem>
              <MenuItem value="processing">Processing</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
            </Select>
          </FormControl>
          
          {bulkUpdateData.status === 'rejected' && (
            <TextField
              fullWidth
              label="Rejection Reason"
              value={bulkUpdateData.rejectionReason}
              onChange={(e) => setBulkUpdateData(prev => ({ ...prev, rejectionReason: e.target.value }))}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
          )}
          
          <TextField
            fullWidth
            label="Review Notes"
            value={bulkUpdateData.reviewNotes}
            onChange={(e) => setBulkUpdateData(prev => ({ ...prev, reviewNotes: e.target.value }))}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUpdateDialog(false)}>Cancel</Button>
          <Button onClick={handleBulkUpdate} variant="contained">
            Update {selectedRequests.length} Request(s)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedDocumentDashboard;
