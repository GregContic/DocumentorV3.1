# ELTNHS Online Enrollment Portal (Frontend)

A modern, glassmorphic web application for Eastern La Trinidad National High School's online enrollment and document management. Built with React and Material-UI, this portal provides a seamless, secure, and user-friendly experience for students, parents, and administrators.

---

## 🚀 Features
- **Digital Document Requests**: Request, track, and receive academic documents online.
- **Online Enrollment**: Complete enrollment applications for Grades 7-12 with AI-powered validation.
- **Admin Dashboard**: Manage users, documents, and enrollment with role-based access.
- **Real-Time Notifications**: Get instant updates on request status.
- **Bank-Level Security**: Secure authentication and data handling.
- **Cloud Integration**: Access your data anywhere, anytime.
- **Responsive Design**: Works on desktop, tablet, and mobile.

## 🛠️ Tech Stack
- **React** (Create React App)
- **Material-UI (MUI)** for UI components and styling
- **React Router** for navigation
- **Context API** for authentication and global state
- **Custom Hooks** for notifications and logic
- **Jest/React Testing Library** for tests

## 📁 Folder Structure
```
frontend/
├── public/                # Static assets (favicon, manifest, etc.)
├── src/
│   ├── assets/            # Images and static resources (e.g., easternestetik.png)
│   ├── components/        # Reusable UI components (Navbar, Sidebar, Layout, etc.)
│   ├── context/           # React Contexts (AuthContext, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components (public, admin, user, etc.)
│   ├── utils/             # Utility functions and helpers
│   ├── App.js             # Main app component
│   └── index.js           # Entry point
├── package.json           # Project metadata and dependencies
└── README.md              # This file
```

## 🖼️ Customization
- **Hero Image**: The main hero image is located at `src/assets/easternestetik.png`. Replace this file to update the homepage photo.
- **Branding**: Update colors, logos, and text in `src/components` and `src/pages/public/Home.js` as needed.

## ⚡ Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm (v8+ recommended)

### Installation
```bash
cd frontend
npm install
```

### Running the App (Development)
```bash
npm start
```
- Open [http://localhost:3000](http://localhost:3000) in your browser.
- The app reloads automatically on code changes.

### Building for Production
```bash
npm run build
```
- Output is in the `build/` folder, ready for deployment.

### Running Tests
```bash
npm test
```
- Runs all tests in watch mode.

## 🌐 Deployment
- Deploy the `build/` folder to your preferred static hosting (Vercel, Netlify, GitHub Pages, etc.).
- For custom domains or HTTPS, follow your host's documentation.

## 🧩 Environment Variables
- Create a `.env` file in `frontend/` for custom environment variables (API endpoints, etc.).
- Example:
	```env
	REACT_APP_API_URL=http://localhost:5000/api
	```

## 🛠️ Troubleshooting
- If you see errors on `npm start`, ensure Node and npm are up to date.
- If images do not load, check the path in `src/pages/public/Home.js` and that the file exists in `src/assets/`.
- For CORS/API issues, verify your backend server allows requests from `localhost:3000`.

## 📚 Learn More
- [React Documentation](https://reactjs.org/)
- [Material-UI Documentation](https://mui.com/)
- [Create React App Docs](https://facebook.github.io/create-react-app/docs/getting-started)

## 👥 Credits
- Developed for Eastern La Trinidad National High School
- UI/UX: Glassmorphic design inspired by modern education portals
- Image credits: School photo property of ELTNHS

## 📝 License
This project is for educational and internal school use. For external use or redistribution, please contact the school administration.
