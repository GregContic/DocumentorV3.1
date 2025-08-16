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
          // Only count students with status 'enrolled'
          const enrolledCount = Array.isArray(data) ? data.filter(e => e.status === 'enrolled').length : 0;
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
                    <Button variant="outlined" size="small" onClick={() => handleManageSection(section)}>
                      Manage
                    </Button>
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
                        <TableCell>Gender</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Section</TableCell>
                        <TableCell>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrolledStudents.map((student, index) => (
                        <TableRow key={student._id || index}>
                          <TableCell>
                            {`${student.firstName || ''} ${student.surname || ''}`.trim() || 'N/A'}
                          </TableCell>
                          <TableCell>{student.sex || 'Not specified'}</TableCell>
                          <TableCell>{student.status}</TableCell>
                          <TableCell>{student.section}</TableCell>
                          <TableCell>{student.gradeToEnroll}</TableCell>
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
