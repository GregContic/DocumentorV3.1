import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Box,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Archive as ArchiveIcon, Edit as EditIcon } from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { enrollmentService } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const gradeLevels = [
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'
];

const SectionManagement = () => {
  const [sections, setSections] = useState([]);
  const [sectionStudentCounts, setSectionStudentCounts] = useState({});
  const [form, setForm] = useState({ name: '', gradeLevel: '', adviser: '', capacity: 40 });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [sectionToArchive, setSectionToArchive] = useState(null);
  const [archiving, setArchiving] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', adviser: '' });
  const [updating, setUpdating] = useState(false);
  const handleManageSection = async (section) => {
    // Always refresh sections and student counts before opening modal
    await fetchSections();
    setSelectedSection(section);
    setManageOpen(true);
    setStudentsLoading(true);
    setEnrolledStudents([]);
    try {
      const token = localStorage.getItem('token');
      // Use the exact section name and gradeLevel as stored
      let sectionName = section.name ? section.name.trim() : '';
      let gradeLevel = section.gradeLevel || '';
      
      console.log('[ManageSection] Original section data:', section);
      console.log('[ManageSection] Using sectionName:', sectionName, 'gradeLevel:', gradeLevel);
      
      // Fetch all enrollments for this section with grade level filtering
      const url = `http://localhost:5000/api/enrollments/by-section?section=${encodeURIComponent(sectionName)}&gradeLevel=${encodeURIComponent(gradeLevel)}`;
      console.log('[ManageSection] Fetching URL:', url);
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[ManageSection] Fetched students for section:', sectionName, 'count:', data.length);
        data.forEach((student, index) => {
          console.log(`[ManageSection] Student ${index}:`, {
            _id: student._id,
            firstName: student.firstName,
            surname: student.surname,
            section: student.section,
            gradeToEnroll: student.gradeToEnroll,
            status: student.status,
            sex: student.sex,
            user: student.user
          });
        });
        setEnrolledStudents(Array.isArray(data) ? data : []);
      } else {
        // Read server error text for debugging
        const text = await res.text();
        console.error('[ManageSection] API error', res.status, text);
        setError(`Failed to load students for section (status ${res.status}).`);
        setEnrolledStudents([]);
      }
    } catch (err) {
      console.error('[ManageSection] Error:', err);
      setError('Failed to load students for section.');
      setEnrolledStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleCloseManage = () => {
    setManageOpen(false);
    setSelectedSection(null);
    setEnrolledStudents([]);
  };

  const getNested = (obj, path, alt = '') => {
    try {
      return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? alt;
    } catch (e) {
      return alt;
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    const birth = new Date(dob);
    if (isNaN(birth)) return '';
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const handleExportSection = () => {
    if (!selectedSection) return;
    const rows = (enrolledStudents || []).map(s => {
      const dob = getNested(s, 'dateOfBirth', getNested(s, 'dob', ''));
      return {
        'Learner Reference Number': getNested(s, 'learnerRefNumber', getNested(s, 'lrn', '')),
        'Surname': getNested(s, 'surname', getNested(s, 'user.lastName', '')),
        'First Name': getNested(s, 'firstName', getNested(s, 'user.firstName', '')),
        'Middle Name': getNested(s, 'middleName', ''),
        'Extension': getNested(s, 'extension', ''),
        'Date of Birth': dob ? new Date(dob).toLocaleDateString() : '',
        'Place of Birth': getNested(s, 'placeOfBirth', ''),
        'Sex': getNested(s, 'sex', ''),
        'Age': calculateAge(dob),
        'Religion': getNested(s, 'religion', ''),
        'Citizenship': getNested(s, 'citizenship', ''),
        'House Number': getNested(s, 'houseNumber', ''),
        'Street': getNested(s, 'street', ''),
        'Barangay': getNested(s, 'barangay', ''),
        'City': getNested(s, 'city', ''),
        'Province': getNested(s, 'province', ''),
        'Zip Code': getNested(s, 'zipCode', ''),
        'Contact Number': getNested(s, 'contactNumber', getNested(s, 'user.phone', getNested(s, 'phone', ''))),
        'Email Address': getNested(s, 'user.email', getNested(s, 'emailAddress', '')),
        'Last School Attended': getNested(s, 'lastSchoolAttended', ''),
        'School Address': getNested(s, 'schoolAddress', ''),
        'Grade Level': getNested(s, 'gradeLevel', getNested(s, 'gradeToEnroll', '')),
        'School Year': getNested(s, 'schoolYear', ''),
        'Parent/Guardian Information': getNested(s, 'guardianInfo', ''),
        "Father's Name": getNested(s, 'fatherName', ''),
        "Father's Occupation": getNested(s, 'fatherOccupation', ''),
        "Father's Contact Number": getNested(s, 'fatherContact', ''),
        "Mother's Name": getNested(s, 'motherName', ''),
        "Mother's Occupation": getNested(s, 'motherOccupation', ''),
        "Mother's Contact Number": getNested(s, 'motherContact', ''),
        'Address': getNested(s, 'address', ''),
        'Enrollment Type': getNested(s, 'enrollmentType', ''),
        'Grade to Enroll': getNested(s, 'gradeToEnroll', ''),
        'Track': getNested(s, 'track', ''),
        'Section': getNested(s, 'section', ''),
        'Application Date': getNested(s, 'applicationDate', '') ? new Date(getNested(s, 'applicationDate')).toLocaleString() : ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows, { origin: 'A1' });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const fileName = `${(selectedSection.name || 'section').replace(/[^a-z0-9_-]/ig, '_')}_${(selectedSection.gradeLevel || '').replace(/[^a-z0-9_-]/ig, '_')}_students.xlsx`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleArchiveSection = async (section) => {
    setSectionToArchive(section);
    setArchiveDialogOpen(true);
  };

  const handleConfirmArchive = async () => {
    if (!sectionToArchive) return;
    
    setArchiving(true);
    try {
      const response = await enrollmentService.archiveStudentsBySection(
        sectionToArchive.name,
        sectionToArchive.gradeLevel
      );
      
      if (response.data.success) {
        setSuccess(`Successfully archived ${response.data.archivedCount} students from section ${sectionToArchive.name}`);
        // Refresh sections and student counts
        await fetchSections();
        // If the manage modal is open for this section, refresh the student list
        if (selectedSection && selectedSection._id === sectionToArchive._id) {
          await handleManageSection(selectedSection);
        }
      } else {
        setError('Failed to archive section students');
      }
    } catch (err) {
      console.error('Error archiving section students:', err);
      setError('Failed to archive section students: ' + (err.response?.data?.message || err.message));
    } finally {
      setArchiving(false);
      setArchiveDialogOpen(false);
      setSectionToArchive(null);
    }
  };

  const handleCancelArchive = () => {
    setArchiveDialogOpen(false);
    setSectionToArchive(null);
  };

  const handleEditSection = (section) => {
    setSectionToEdit(section);
    setEditForm({
      name: section.name,
      adviser: section.adviser
    });
    setEditDialogOpen(true);
  };

  const handleEditFormChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleConfirmEdit = async () => {
    if (!sectionToEdit) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/sections/${sectionToEdit._id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editForm.name,
          adviser: editForm.adviser
        })
      });
      
      if (res.ok) {
        setSuccess('Section updated successfully');
        await fetchSections();
        setEditDialogOpen(false);
        setSectionToEdit(null);
        setEditForm({ name: '', adviser: '' });
      } else {
        const errorData = await res.json();
        setError(errorData.message || 'Failed to update section');
      }
    } catch (err) {
      console.error('Error updating section:', err);
      setError('Failed to update section: ' + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditDialogOpen(false);
    setSectionToEdit(null);
    setEditForm({ name: '', adviser: '' });
  };

  useEffect(() => {
    fetchSections();
  }, []);

  // Fetch student counts for all sections after sections are loaded
  useEffect(() => {
    if (sections.length > 0) {
      fetchSectionStudentCounts();
    }
  }, [sections]);

  // Helper to fetch student count for each section
  const fetchSectionStudentCounts = async () => {
    const token = localStorage.getItem('token');
    const counts = {};
    await Promise.all(sections.map(async (section) => {
      try {
        // Use the exact section name and gradeLevel as stored
        let sectionName = section.name ? section.name.trim() : '';
        let gradeLevel = section.gradeLevel || '';
        
        console.log('[SectionCounts] Checking section:', sectionName, 'grade:', gradeLevel);
        
        // Fetch all enrollments for this section with grade level filtering
        const url = `http://localhost:5000/api/enrollments/by-section?section=${encodeURIComponent(sectionName)}&gradeLevel=${encodeURIComponent(gradeLevel)}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Only count students with status 'enrolled' and not archived
          const enrolledCount = Array.isArray(data) ? data.filter(e => e.status === 'enrolled' && !e.isArchived).length : 0;
          counts[section._id] = enrolledCount;
          console.log('[SectionCounts] Section', sectionName, 'has', enrolledCount, 'enrolled students');
        } else {
          const text = await res.text();
          console.error('[SectionCounts] API error for section', sectionName, res.status, text);
          counts[section._id] = 0;
        }
      } catch (err) {
        console.error('[SectionCounts] Error for section', section.name, err);
        counts[section._id] = 0;
      }
    }));
    setSectionStudentCounts(counts);
  };

  const fetchSections = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/sections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load sections');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/sections', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForm({ name: '', gradeLevel: '', adviser: '', capacity: 40 });
        setSuccess('Section created successfully');
        fetchSections();
      } else {
        setError('Failed to create section');
      }
    } catch (err) {
      setError('Failed to create section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Section Management">
      <Container maxWidth="md">
        <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
          Manage Sections
        </Typography>
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField label="Section Name" name="name" value={form.name} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField select label="Grade Level" name="gradeLevel" value={form.gradeLevel} onChange={handleChange} fullWidth>
                {gradeLevels.map(g => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Adviser" name="adviser" value={form.adviser} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField label="Capacity" name="capacity" type="number" value={form.capacity} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button variant="contained" onClick={handleCreate} disabled={loading} fullWidth>
                Create
              </Button>
            </Grid>
          </Grid>
        </Paper>
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Grade Level</TableCell>
                <TableCell>Adviser</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sections.map(section => (
                <TableRow key={section._id}>
                  <TableCell>{section.name}</TableCell>
                  <TableCell>{section.gradeLevel}</TableCell>
                  <TableCell>{section.adviser}</TableCell>
                  <TableCell>
                    {sectionStudentCounts[section._id] !== undefined
                      ? `${sectionStudentCounts[section._id]}/${section.capacity}`
                      : `0/${section.capacity}`}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={() => handleManageSection(section)}
                        sx={{ textTransform: 'none' }}
                      >
                        Manage
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        startIcon={<EditIcon />}
                        onClick={() => handleEditSection(section)}
                        sx={{ textTransform: 'none' }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="warning"
                        startIcon={<ArchiveIcon />}
                        onClick={() => handleArchiveSection(section)}
                        disabled={sectionStudentCounts[section._id] === 0}
                        sx={{ 
                          textTransform: 'none',
                          borderColor: 'orange',
                          color: 'orange',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 152, 0, 0.1)',
                            borderColor: 'darkorange',
                          },
                          '&:disabled': {
                            borderColor: 'rgba(0, 0, 0, 0.12)',
                            color: 'rgba(0, 0, 0, 0.26)',
                          }
                        }}
                      >
                        Archive
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        {/* Manage Section Modal */}
        <Dialog open={manageOpen} onClose={handleCloseManage} maxWidth="xl" fullWidth>
          <DialogTitle>Manage Section: {selectedSection?.name}</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Enrolled Students in this Section
            </Typography>
            {studentsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
                <CircularProgress />
              </Box>
            ) : enrolledStudents.length === 0 ? (
              <Typography>No students enrolled in this section.</Typography>
            ) : (
              <Grid container spacing={3} alignItems="flex-start">
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Male Students</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        // Show all students with 'enrolled' status and male gender
                        const maleEnrolled = enrolledStudents.filter(s => 
                          s.status === 'enrolled' && 
                          (s.sex || '').toLowerCase() === 'male'
                        );
                        console.log('[ManageSection Modal] Male students found:', maleEnrolled.length);
                        
                        if (maleEnrolled.length === 0) {
                          return <TableRow><TableCell colSpan={3}>No male students enrolled.</TableCell></TableRow>;
                        }
                        return maleEnrolled.map(student => (
                          <TableRow key={student._id}>
                            <TableCell>{
                              (student.firstName || student.surname)
                                ? `${student.firstName || ''} ${student.surname || ''}`.trim()
                                : student.user
                                  ? `${student.user.firstName || ''} ${student.user.lastName || ''}`.trim()
                                  : 'N/A'
                            }</TableCell>
                            <TableCell>{student.user?.email || student.emailAddress}</TableCell>
                            <TableCell>{student.status}</TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Female Students</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        // Show all students with 'enrolled' status and female gender
                        const femaleEnrolled = enrolledStudents.filter(s => 
                          s.status === 'enrolled' && 
                          (s.sex || '').toLowerCase() === 'female'
                        );
                        console.log('[ManageSection Modal] Female students found:', femaleEnrolled.length);
                        
                        if (femaleEnrolled.length === 0) {
                          return <TableRow><TableCell colSpan={3}>No female students enrolled.</TableCell></TableRow>;
                        }
                        return femaleEnrolled.map(student => (
                          <TableRow key={student._id}>
                            <TableCell>{
                              (student.firstName || student.surname)
                                ? `${student.firstName || ''} ${student.surname || ''}`.trim()
                                : student.user
                                  ? `${student.user.firstName || ''} ${student.user.lastName || ''}`.trim()
                                  : 'N/A'
                            }</TableCell>
                            <TableCell>{student.user?.email || student.emailAddress}</TableCell>
                            <TableCell>{student.status}</TableCell>
                          </TableRow>
                        ));
                      })()}
                    </TableBody>
                  </Table>
                </Grid>
                
                {/* Debug section - show all students for troubleshooting */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
                    All Students in Section (Debug Info)
                  </Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Gender</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrolledStudents.map((student, index) => (
                        <TableRow key={student._id || index}>
                          <TableCell>
                            {`${student.firstName || ''} ${student.surname || ''}`.trim() || 'N/A'}
                          </TableCell>
                          <TableCell>{student.user?.email || student.emailAddress || 'N/A'}</TableCell>
                          <TableCell>{student.sex || 'Not specified'}</TableCell>
                          <TableCell>{student.status}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseManage} variant="contained">Close</Button>
            <Button
              onClick={handleExportSection}
              variant="outlined"
              color="primary"
              disabled={studentsLoading || (enrolledStudents || []).length === 0}
              sx={{ textTransform: 'none' }}
            >
              Export to Excel
            </Button>
          </DialogActions>
        </Dialog>

        {/* Archive Section Confirmation Dialog */}
        <Dialog 
          open={archiveDialogOpen} 
          onClose={handleCancelArchive}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            backgroundColor: 'warning.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <ArchiveIcon />
            Archive Section: {sectionToArchive?.name}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to archive all students in section <strong>{sectionToArchive?.name}</strong> 
              ({sectionToArchive?.gradeLevel})?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              This will archive approximately <strong>{sectionStudentCounts[sectionToArchive?._id] || 0}</strong> students.
            </Typography>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action will move all enrolled students in this section to the enrollment archive. 
              You can restore them individually from the enrollment archive if needed.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleCancelArchive}
              disabled={archiving}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmArchive}
              variant="contained"
              color="warning"
              disabled={archiving}
              startIcon={archiving ? <CircularProgress size={16} /> : <ArchiveIcon />}
              sx={{ 
                textTransform: 'none',
                ml: 2
              }}
            >
              {archiving ? 'Archiving...' : 'Archive Section'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Section Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={handleCancelEdit}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ 
            backgroundColor: 'primary.main',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <EditIcon />
            Edit Section: {sectionToEdit?.name}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  name="name"
                  label="Section Name"
                  value={editForm.name}
                  onChange={handleEditFormChange}
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  name="adviser"
                  label="Adviser"
                  value={editForm.adviser}
                  onChange={handleEditFormChange}
                  fullWidth
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleCancelEdit}
              disabled={updating}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmEdit}
              variant="contained"
              color="primary"
              disabled={updating || !editForm.name.trim() || !editForm.adviser.trim()}
              startIcon={updating ? <CircularProgress size={16} /> : <EditIcon />}
              sx={{ 
                textTransform: 'none',
                ml: 2
              }}
            >
              {updating ? 'Updating...' : 'Update Section'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
        </Snackbar>
        <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Snackbar>
      </Container>
    </AdminLayout>
  );
};

export default SectionManagement;
