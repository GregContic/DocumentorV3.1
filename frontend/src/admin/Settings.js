import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Backup as BackupIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Storage as StorageIcon,
  RestartAlt as ResetIcon,
} from '@mui/icons-material';
import { settingsService } from '../services/api';

const Settings = () => {
  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    schoolName: 'Eastern Luzon Technological National High School',
    schoolAddress: '123 School Street, City, Province',
    schoolContactNumber: '(123) 456-7890',
    schoolEmail: 'admin@eltnhs.edu.ph',
    academicYear: '2024-2025',
    semester: 'First Semester',
    documentProcessingDays: 3,
    maxRequestsPerUser: 5,
  });

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: true,
    sessionTimeout: 30, // minutes
    passwordMinLength: 8,
    requireStrongPasswords: true,
    enableTwoFactorAuth: false,
    maxLoginAttempts: 5,
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newRequestNotifications: true,
    statusUpdateNotifications: true,
    dailyReportEmails: false,
    weeklyReportEmails: true,
    notificationEmail: 'admin@eltnhs.edu.ph',
  });

  // Document Settings
  const [documentSettings, setDocumentSettings] = useState({
    enableQRCodes: true,
    qrCodeExpirationDays: 30,
    enableAIProcessing: true,
    enableChatbot: true,
    autoArchiveCompletedRequests: true,
    autoArchiveDays: 90,
    showDeleteEnrollmentButton: true, // NEW
  });

  // UI State
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);
  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsService.getSettings();
      const settings = response.data.settings;
      
      // Map the settings to state
      setSystemSettings({
        schoolName: settings.schoolName || '',
        schoolAddress: settings.schoolAddress || '',
        schoolContactNumber: settings.schoolContactNumber || '',
        schoolEmail: settings.schoolEmail || '',
        academicYear: settings.academicYear || '',
        semester: settings.semester || 'First Semester',
        documentProcessingDays: settings.documentProcessingDays || 3,
        maxRequestsPerUser: settings.maxRequestsPerUser || 5,
      });

      setSecuritySettings({
        requireEmailVerification: settings.requireEmailVerification ?? true,
        sessionTimeout: settings.sessionTimeout || 30,
        passwordMinLength: settings.passwordMinLength || 8,
        requireStrongPasswords: settings.requireStrongPasswords ?? true,
        enableTwoFactorAuth: settings.enableTwoFactorAuth ?? false,
        maxLoginAttempts: settings.maxLoginAttempts || 5,
      });

      setNotificationSettings({
        emailNotifications: settings.emailNotifications ?? true,
        newRequestNotifications: settings.newRequestNotifications ?? true,
        statusUpdateNotifications: settings.statusUpdateNotifications ?? true,
        dailyReportEmails: settings.dailyReportEmails ?? false,
        weeklyReportEmails: settings.weeklyReportEmails ?? true,
        notificationEmail: settings.notificationEmail || '',
      });

      setDocumentSettings({
        enableQRCodes: settings.enableQRCodes ?? true,
        qrCodeExpirationDays: settings.qrCodeExpirationDays || 30,
        enableAIProcessing: settings.enableAIProcessing ?? true,
        enableChatbot: settings.enableChatbot ?? true,
        autoArchiveCompletedRequests: settings.autoArchiveCompletedRequests ?? true,
        autoArchiveDays: settings.autoArchiveDays || 90,
        showDeleteEnrollmentButton: settings.showDeleteEnrollmentButton ?? true, // NEW
      });
      
    } catch (error) {
      console.error('Error loading settings:', error);
      showSnackbar('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingsChange = (field, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSecuritySettingsChange = (field, value) => {
    setSecuritySettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationSettingsChange = (field, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDocumentSettingsChange = (field, value) => {
    setDocumentSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };
  const saveSettings = async () => {
    setLoading(true);
    try {
      const allSettings = {
        ...systemSettings,
        ...securitySettings,
        ...notificationSettings,
        ...documentSettings,
      };
      
      await settingsService.updateSettings(allSettings);
      showSnackbar('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      showSnackbar('Failed to save settings', 'error');
    } finally {
      setLoading(false);
    }
  };
  const resetToDefaults = async () => {
    try {
      setLoading(true);
      await settingsService.resetSettings();
      await loadSettings(); // Reload settings after reset
      setResetDialogOpen(false);
      showSnackbar('Settings reset to defaults', 'info');
    } catch (error) {
      console.error('Error resetting settings:', error);
      showSnackbar('Failed to reset settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <SettingsIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          System Settings
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <Grid container spacing={3}>
        {/* System Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<StorageIcon color="primary" />}
              title="System Information"
              subheader="Basic school and system configuration"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School Name"
                    value={systemSettings.schoolName}
                    onChange={(e) => handleSystemSettingsChange('schoolName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="School Address"
                    multiline
                    rows={2}
                    value={systemSettings.schoolAddress}
                    onChange={(e) => handleSystemSettingsChange('schoolAddress', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Contact Number"
                    value={systemSettings.schoolContactNumber}
                    onChange={(e) => handleSystemSettingsChange('schoolContactNumber', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={systemSettings.schoolEmail}
                    onChange={(e) => handleSystemSettingsChange('schoolEmail', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Academic Year"
                    value={systemSettings.academicYear}
                    onChange={(e) => handleSystemSettingsChange('academicYear', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Semester</InputLabel>
                    <Select
                      value={systemSettings.semester}
                      label="Semester"
                      onChange={(e) => handleSystemSettingsChange('semester', e.target.value)}
                    >
                      <MenuItem value="First Semester">First Semester</MenuItem>
                      <MenuItem value="Second Semester">Second Semester</MenuItem>
                      <MenuItem value="Summer">Summer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Document Processing Days"
                    type="number"
                    value={systemSettings.documentProcessingDays}
                    onChange={(e) => handleSystemSettingsChange('documentProcessingDays', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 30 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Max Requests Per User"
                    type="number"
                    value={systemSettings.maxRequestsPerUser}
                    onChange={(e) => handleSystemSettingsChange('maxRequestsPerUser', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 20 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<SecurityIcon color="primary" />}
              title="Security Settings"
              subheader="Authentication and security configuration"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.requireEmailVerification}
                        onChange={(e) => handleSecuritySettingsChange('requireEmailVerification', e.target.checked)}
                      />
                    }
                    label="Require Email Verification"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.requireStrongPasswords}
                        onChange={(e) => handleSecuritySettingsChange('requireStrongPasswords', e.target.checked)}
                      />
                    }
                    label="Require Strong Passwords"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={securitySettings.enableTwoFactorAuth}
                        onChange={(e) => handleSecuritySettingsChange('enableTwoFactorAuth', e.target.checked)}
                      />
                    }
                    label="Enable Two-Factor Authentication"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Session Timeout (minutes)"
                    type="number"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => handleSecuritySettingsChange('sessionTimeout', parseInt(e.target.value))}
                    inputProps={{ min: 5, max: 480 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password Min Length"
                    type="number"
                    value={securitySettings.passwordMinLength}
                    onChange={(e) => handleSecuritySettingsChange('passwordMinLength', parseInt(e.target.value))}
                    inputProps={{ min: 6, max: 50 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Max Login Attempts"
                    type="number"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => handleSecuritySettingsChange('maxLoginAttempts', parseInt(e.target.value))}
                    inputProps={{ min: 3, max: 10 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<NotificationsIcon color="primary" />}
              title="Notification Settings"
              subheader="Email and notification preferences"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => handleNotificationSettingsChange('emailNotifications', e.target.checked)}
                      />
                    }
                    label="Enable Email Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.newRequestNotifications}
                        onChange={(e) => handleNotificationSettingsChange('newRequestNotifications', e.target.checked)}
                      />
                    }
                    label="New Request Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.statusUpdateNotifications}
                        onChange={(e) => handleNotificationSettingsChange('statusUpdateNotifications', e.target.checked)}
                      />
                    }
                    label="Status Update Notifications"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.dailyReportEmails}
                        onChange={(e) => handleNotificationSettingsChange('dailyReportEmails', e.target.checked)}
                      />
                    }
                    label="Daily Report Emails"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={notificationSettings.weeklyReportEmails}
                        onChange={(e) => handleNotificationSettingsChange('weeklyReportEmails', e.target.checked)}
                      />
                    }
                    label="Weekly Report Emails"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notification Email"
                    type="email"
                    value={notificationSettings.notificationEmail}
                    onChange={(e) => handleNotificationSettingsChange('notificationEmail', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Document Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              avatar={<BackupIcon color="primary" />}
              title="Document Settings"
              subheader="Document processing and feature configuration"
            />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={documentSettings.enableQRCodes}
                        onChange={(e) => handleDocumentSettingsChange('enableQRCodes', e.target.checked)}
                      />
                    }
                    label="Enable QR Codes"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={documentSettings.enableAIProcessing}
                        onChange={(e) => handleDocumentSettingsChange('enableAIProcessing', e.target.checked)}
                      />
                    }
                    label="Enable AI Document Processing"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={documentSettings.enableChatbot}
                        onChange={(e) => handleDocumentSettingsChange('enableChatbot', e.target.checked)}
                      />
                    }
                    label="Enable AI Chatbot"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={documentSettings.autoArchiveCompletedRequests}
                        onChange={(e) => handleDocumentSettingsChange('autoArchiveCompletedRequests', e.target.checked)}
                      />
                    }
                    label="Auto-Archive Completed Requests"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="QR Code Expiration (days)"
                    type="number"
                    value={documentSettings.qrCodeExpirationDays}
                    onChange={(e) => handleDocumentSettingsChange('qrCodeExpirationDays', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 365 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Auto-Archive After (days)"
                    type="number"
                    value={documentSettings.autoArchiveDays}
                    onChange={(e) => handleDocumentSettingsChange('autoArchiveDays', parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 365 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={documentSettings.showDeleteEnrollmentButton}
                        onChange={e => handleDocumentSettingsChange('showDeleteEnrollmentButton', e.target.checked)}
                      />
                    }
                    label="Show Delete Button on Enrollment Dashboard"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={saveSettings}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(45deg, #2e7d32, #4caf50)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #1b5e20, #2e7d32)',
                  },
                }}
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<ResetIcon />}
                onClick={() => setResetDialogOpen(true)}
                color="warning"
              >
                Reset to Defaults
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Chip
                label="Last Saved: Today, 2:30 PM"
                variant="outlined"
                color="primary"
              />
            </Box>
          </Paper>
        </Grid>        </Grid>
      )}

      {/* Reset Confirmation Dialog */}
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Reset Settings to Defaults</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all settings to their default values? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={resetToDefaults} color="warning" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Settings;
