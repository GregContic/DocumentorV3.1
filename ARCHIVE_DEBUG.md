# Archive System Debug Guide

## Issue: Archive doesn't work

The archive system has been fully implemented but may not be working due to setup issues. Here's how to fix it:

## 1. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On Windows, start MongoDB service or run:
mongod --dbpath "C:\data\db"
```

## 2. Start Backend Server
Navigate to the backend directory and start the server:
```bash
cd backend
npm install  # if not already installed
npm start    # or node server.js
```

The server should show:
- "Connected to MongoDB"  
- "Server is running on port 5000"

## 3. Start Frontend
Navigate to the frontend directory:
```bash
cd frontend
npm install  # if not already installed
npm start
```

## 4. Login as Admin
- Go to http://localhost:3000
- Login with admin credentials
- Navigate to Admin Dashboard → Archive

## 5. Test the Migration Script
To move existing completed inquiries to archived status:
```bash
cd backend
node scripts/migrateCompletedInquiries.js
```

## Common Issues Fixed:

### ✅ API Response Format
- Fixed backend inquiry controller to return consistent response format
- Updated frontend to access `response.data.data` instead of `response.data.inquiries`

### ✅ Field Names  
- Fixed table rendering to use correct field names from database models
- Document: `doc.user.firstName`, `doc.user.lastName` instead of `doc.studentName`
- Inquiry: `inquiry.user.firstName`, `inquiry.user.lastName` instead of `inquiry.name`

### ✅ Routes and Navigation
- Single archive page with tabs for documents and inquiries
- Correct routing: `/admin/archive`
- Navigation updated to show single "Archive" link

### ✅ Automatic Archiving
- When inquiry status is set to "completed", it automatically becomes "archived"
- Backend controller handles this in `updateInquiryStatus` method

## Current Archive Features:
- ✅ Unified archive page with tabs
- ✅ Search functionality for both documents and inquiries  
- ✅ Pagination
- ✅ View details dialog
- ✅ Restore functionality
- ✅ Automatic archiving of completed inquiries
- ✅ Migration script for existing data

## To Test:
1. Create some document requests and inquiries
2. Mark them as "completed" 
3. Check that they appear in the archive page
4. Test search and restore functionality
