import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Ensure API_URL doesn't end with a slash
const normalizedURL = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

const api = axios.create({
  baseURL: normalizedURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => {
    localStorage.removeItem('token');
  },
};

// Document request services
export const documentService = {
  createRequest: (requestData) => {
    // Handle FormData for file uploads
    const config = requestData instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    return api.post('/api/documents/request', requestData, config);
  },
  getMyRequests: () => api.get('/api/documents/my-requests'),
  getRequestById: (id) => api.get(`/api/documents/request/${id}`),
  downloadPickupStub: (requestId) => api.get(`/api/documents/request/${requestId}/pickup-stub`, { 
    responseType: 'blob' 
  }),
  
  // Admin specific endpoints
  getAllRequests: () => api.get('/api/documents/admin/documents/requests'),
  getFilteredRequests: (params) => api.get('/api/documents/admin/documents/filtered-requests', { params }),
  getDashboardAnalytics: (period = '30') => api.get(`/api/documents/admin/documents/analytics?period=${period}`),
  updateRequestStatus: (requestId, statusData) => 
    api.patch(`/api/documents/admin/documents/request/${requestId}/status`, statusData),
  bulkUpdateRequests: (updateData) => 
    api.patch('/api/documents/admin/documents/bulk-update', updateData),
  updateProcessingStep: (requestId, stepData) =>
    api.patch(`/api/documents/admin/documents/request/${requestId}/processing-step`, stepData),
  getRequestStats: () => api.get('/api/documents/admin/documents/stats'),
  
  // Archive endpoints
  getArchivedDocuments: () => api.get('/api/documents/admin/documents/archived-requests'),
  archiveRequest: (requestId) => 
    api.patch(`/api/documents/admin/documents/request/${requestId}/archive`),
  restoreDocument: (requestId) => 
    api.patch(`/api/documents/admin/documents/request/${requestId}/restore`),
  bulkArchiveCompletedRequests: () =>
    api.post('/api/documents/admin/documents/bulk-archive-completed'),
  
  // QR Code and Pickup endpoints
  verifyPickupQR: (qrData) => 
    api.post('/api/documents/admin/documents/verify-qr', { qrData }),
  markAsPickedUp: (requestId, pickupData) =>
    api.patch(`/api/documents/admin/documents/request/${requestId}/mark-picked-up`, pickupData),
};

// Enrollment services
export const enrollmentService = {
  submitEnrollment: (data) => {
    // Handle both FormData and regular objects
    const config = data instanceof FormData ? {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    } : {};
    return api.post('/api/enrollments', data, config);
  },
  getMyEnrollmentStatus: () => api.get('/api/enrollments/my-status'),
  getAllEnrollments: () => api.get('/api/enrollments/admin'),
  getArchivedEnrollments: () => api.get('/api/enrollments/admin/archived'),
  archiveEnrollment: (id) => api.put(`/api/enrollments/${id}/archive`),
  restoreEnrollment: (id) => api.put(`/api/enrollments/${id}/restore`),
  bulkArchiveCompletedEnrollments: () => api.post('/api/enrollments/admin/bulk-archive'),
  archiveStudentsBySection: (sectionName, gradeLevel) => 
    api.post('/api/enrollments/admin/archive-by-section', { sectionName, gradeLevel }),
  updateEnrollmentStatus: (id, statusData) => api.put(`/api/enrollments/${id}/status`, statusData),
  getSectionsByGrade: (gradeLevel) => api.get(`/api/enrollments/sections?gradeLevel=${encodeURIComponent(gradeLevel)}`),
  deleteEnrollment: (id) => api.delete(`/api/enrollments/${id}`),
};

// Inquiry services
export const inquiryService = {
  // Student endpoints
  createInquiry: (inquiryData) => api.post('/api/inquiries', inquiryData),
  getMyInquiries: () => api.get('/api/inquiries/my-inquiries'),
  getInquiryById: (id) => api.get(`/api/inquiries/${id}`),
  
  // Admin endpoints
  getAllInquiries: () => api.get('/api/inquiries/admin/inquiries'),
  updateInquiryStatus: (inquiryId, status) => 
    api.patch(`/api/inquiries/admin/inquiries/${inquiryId}/status`, { status }),
  replyToInquiry: (inquiryId, message) => 
    api.post(`/api/inquiries/admin/inquiries/${inquiryId}/reply`, { message }),
  deleteInquiry: (inquiryId) => api.delete(`/api/inquiries/admin/inquiries/${inquiryId}`),
  getInquiryStats: () => api.get('/api/inquiries/admin/stats'),
  // Inquiry archive methods
  getArchivedInquiries: () => 
    api.get('/api/inquiries/admin/archived-inquiries'),
  archiveInquiry: (inquiryId) =>
    api.patch(`/api/inquiries/admin/inquiries/${inquiryId}/archive`),
  restoreInquiry: (inquiryId) =>
    api.patch(`/api/inquiries/admin/inquiries/${inquiryId}/restore`),
  bulkArchiveCompletedInquiries: () =>
    api.post('/api/inquiries/admin/bulk-archive-completed'),
};

// Settings service
export const settingsService = {
  getSettings: () => api.get('/api/settings'),
  updateSettings: (settings) => api.put('/api/settings', settings),
  resetSettings: () => api.post('/api/settings/reset'),
  getPublicSettings: () => api.get('/api/settings/public'),
};

// Form 137 Stub service
export const form137StubService = {
  createStub: (stubData) => api.post('/api/form137-stubs/create', stubData),
  getUserStubs: () => api.get('/api/form137-stubs/my-stubs'),
  getStubById: (id) => api.get(`/api/form137-stubs/${id}`),
  // Admin methods
  getAllStubs: (params) => api.get('/api/form137-stubs', { params }),
  updateStubStatus: (id, statusData) => api.put(`/api/form137-stubs/${id}/status`, statusData),
  verifyStubByCode: (stubCode) => api.get(`/api/form137-stubs/verify/${stubCode}`),
};

// Form 138 Stub service
export const form138StubService = {
  createStub: (stubData) => api.post('/api/form138-stubs/create', stubData),
  getUserStubs: () => api.get('/api/form138-stubs/my-stubs'),
  getStubById: (id) => api.get(`/api/form138-stubs/${id}`),
  // Admin methods
  getAllStubs: (params) => api.get('/api/form138-stubs', { params }),
  updateStubStatus: (id, statusData) => api.put(`/api/form138-stubs/${id}/status`, statusData),
  verifyStubByCode: (stubCode) => api.get(`/api/form138-stubs/verify/${stubCode}`),
};

// Chatbot service
export const chatbotService = {
  sendMessage: (message, pageContext) => api.post('/api/chatbot/message', { message, pageContext }),
  getConversationHistory: () => api.get('/api/chatbot/conversation-history'),
  clearConversationHistory: () => api.delete('/api/chatbot/conversation-history'),
};

export default api;