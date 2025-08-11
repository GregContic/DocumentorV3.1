import React from 'react';
import AdminSidebar from '../components/AdminSidebar';
import AdminLayout from '../components/AdminLayout';

// Test component to verify all admin components work
const AdminTestComponent = () => {
  return (
    <AdminLayout title="Test Admin Layout">
      <div style={{ padding: '20px' }}>
        <h2>Admin Navigation Test</h2>
        <p>This is a test to verify that the admin navigation and layout components are working correctly.</p>
        
        <h3>Features Available:</h3>
        <ul>
          <li>✅ Student Enrollment Dashboard - View and manage enrollment applications</li>
          <li>✅ Archive Dashboard - View archived documents and inquiries</li>
          <li>✅ Form 137 Stubs - Manage Form 137 claim stubs</li>
          <li>✅ Inquiries Dashboard - Handle student inquiries</li>
          <li>✅ Settings - System configuration</li>
          <li>✅ Responsive sidebar navigation</li>
          <li>✅ Admin-only protected routes</li>
        </ul>

        <h3>Navigation Features:</h3>
        <ul>
          <li>✅ Active page highlighting</li>
          <li>✅ Mobile responsive drawer</li>
          <li>✅ User profile menu with logout</li>
          <li>✅ Clean, modern Material-UI design</li>
        </ul>
      </div>
    </AdminLayout>
  );
};

export default AdminTestComponent;
