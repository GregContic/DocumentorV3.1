import { useState, useEffect } from 'react';
import { enrollmentService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const useEnrollmentNotifications = () => {
  const [hasApprovedEnrollment, setHasApprovedEnrollment] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const checkEnrollmentStatus = async () => {
    if (!isAuthenticated || !user || user.role === 'admin') {
      return;
    }

    try {
      setLoading(true);
      console.log('🔔 Checking enrollment status for notifications...');
      const response = await enrollmentService.getMyEnrollmentStatus();
      const data = response.data;
      
      console.log('📋 Enrollment data received:', data);
      
      if (data.success && data.data) {
        setEnrollmentData(data.data);
        const isApproved = data.data.status === 'approved';
        setHasApprovedEnrollment(isApproved);
        console.log(`✅ Enrollment status: ${data.data.status}, Approved: ${isApproved}`);
      } else {
        setHasApprovedEnrollment(false);
        setEnrollmentData(null);
        console.log('ℹ️ No enrollment found');
      }
    } catch (error) {
      // If there's no enrollment, that's not an error for notifications
      setHasApprovedEnrollment(false);
      setEnrollmentData(null);
      console.log('⚠️ No enrollment data available:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkEnrollmentStatus();
    
    // Check every 30 seconds for status updates
    const interval = setInterval(checkEnrollmentStatus, 30000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  return {
    hasApprovedEnrollment,
    enrollmentData,
    loading,
    refreshStatus: checkEnrollmentStatus
  };
};

export default useEnrollmentNotifications;
