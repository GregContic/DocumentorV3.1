import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { Bar, Pie, Line } from 'react-chartjs-2';
import AdminLayout from '../../components/AdminLayout';
import 'chart.js/auto';

const fetchStats = async () => {
  // Replace with your actual API endpoints
  const [enrollmentsRes, documentsRes, inquiriesRes] = await Promise.all([
    fetch('http://localhost:5000/api/enrollments/admin', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }),
    fetch('http://localhost:5000/api/documents/admin', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    }),
    fetch('http://localhost:5000/api/inquiries/admin', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
  ]);
  return {
    enrollments: enrollmentsRes.ok ? await enrollmentsRes.json() : [],
    documents: documentsRes.ok ? await documentsRes.json() : [],
    inquiries: inquiriesRes.ok ? await inquiriesRes.json() : [],
  };
};

const getEnrollmentStats = (enrollments) => {
  const byGrade = {};
  const byStatus = {};
  enrollments.forEach(e => {
    const grade = e.gradeToEnroll || e.gradeLevel || 'Unknown';
    byGrade[grade] = (byGrade[grade] || 0) + 1;
    byStatus[e.status] = (byStatus[e.status] || 0) + 1;
  });
  return { byGrade, byStatus };
};

const getDocumentStats = (documents) => {
  const byType = {};
  const byStatus = {};
  documents.forEach(d => {
    byType[d.type || 'Unknown'] = (byType[d.type || 'Unknown'] || 0) + 1;
    byStatus[d.status] = (byStatus[d.status] || 0) + 1;
  });
  return { byType, byStatus };
};

const getInquiryStats = (inquiries) => {
  const byStatus = {};
  inquiries.forEach(i => {
    byStatus[i.status] = (byStatus[i.status] || 0) + 1;
  });
  return { byStatus };
};

const AdminStatistics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        setError('Failed to load statistics.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  let enrollmentStats = { byGrade: {}, byStatus: {} };
  let documentStats = { byType: {}, byStatus: {} };
  let inquiryStats = { byStatus: {} };
  if (stats) {
    enrollmentStats = getEnrollmentStats(stats.enrollments);
    documentStats = getDocumentStats(stats.documents);
    inquiryStats = getInquiryStats(stats.inquiries);
  }

  return (
    <AdminLayout title="Statistics & Analytics">
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          System Statistics & Analytics
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
            <CircularProgress size={60} />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Grid container spacing={4}>
            {/* Enrollment by Grade */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Enrollments by Grade Level
                </Typography>
                <Bar
                  data={{
                    labels: Object.keys(enrollmentStats.byGrade),
                    datasets: [{
                      label: 'Enrollments',
                      data: Object.values(enrollmentStats.byGrade),
                      backgroundColor: '#4caf50',
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } }
                  }}
                />
              </Paper>
            </Grid>
            {/* Enrollment by Status */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Enrollments by Status
                </Typography>
                <Pie
                  data={{
                    labels: Object.keys(enrollmentStats.byStatus),
                    datasets: [{
                      label: 'Enrollments',
                      data: Object.values(enrollmentStats.byStatus),
                      backgroundColor: ['#4caf50', '#ff9800', '#f44336', '#2196f3'],
                    }]
                  }}
                  options={{ responsive: true }}
                />
              </Paper>
            </Grid>
            {/* Documents by Type */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Documents by Type
                </Typography>
                <Bar
                  data={{
                    labels: Object.keys(documentStats.byType),
                    datasets: [{
                      label: 'Documents',
                      data: Object.values(documentStats.byType),
                      backgroundColor: '#2196f3',
                    }]
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } }
                  }}
                />
              </Paper>
            </Grid>
            {/* Documents by Status */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Documents by Status
                </Typography>
                <Pie
                  data={{
                    labels: Object.keys(documentStats.byStatus),
                    datasets: [{
                      label: 'Documents',
                      data: Object.values(documentStats.byStatus),
                      backgroundColor: ['#2196f3', '#ff9800', '#f44336', '#4caf50'],
                    }]
                  }}
                  options={{ responsive: true }}
                />
              </Paper>
            </Grid>
            {/* Inquiries by Status */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Inquiries by Status
                </Typography>
                <Pie
                  data={{
                    labels: Object.keys(inquiryStats.byStatus),
                    datasets: [{
                      label: 'Inquiries',
                      data: Object.values(inquiryStats.byStatus),
                      backgroundColor: ['#ff9800', '#4caf50', '#f44336', '#2196f3'],
                    }]
                  }}
                  options={{ responsive: true }}
                />
              </Paper>
            </Grid>
          </Grid>
        )}
      </Box>
    </AdminLayout>
  );
};

export default AdminStatistics;
