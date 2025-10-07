# Vercel Deployment Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
│                  https://your-app.vercel.app                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL EDGE NETWORK                       │
│                    (Global CDN + Router)                     │
└───────┬─────────────────────────────────┬───────────────────┘
        │                                 │
        │ Static Files (/, /admin, etc)   │ API Calls (/api/*)
        ▼                                 ▼
┌──────────────────┐            ┌──────────────────────────────┐
│  REACT FRONTEND  │            │  SERVERLESS API FUNCTIONS    │
│   (Static CDN)   │            │                              │
│                  │            │  ┌─────────────────────────┐ │
│  • index.html    │            │  │   api/index.js          │ │
│  • JS bundles    │            │  │   (Express Backend)     │ │
│  • CSS           │            │  └─────────────────────────┘ │
│  • Images        │            │                              │
│                  │            │  ┌─────────────────────────┐ │
│  Built from:     │            │  │   api/ocr.py            │ │
│  frontend/build/ │            │  │   (Python OCR)          │ │
│                  │            │  └─────────────────────────┘ │
└──────────────────┘            └────────────┬─────────────────┘
                                             │
                                             │ DB Queries
                                             ▼
                                ┌────────────────────────────┐
                                │    MONGODB ATLAS           │
                                │    (Cloud Database)        │
                                │                            │
                                │  • users                   │
                                │  • documentrequests        │
                                │  • enrollments             │
                                │  • inquiries               │
                                │  • settings                │
                                │  • sections                │
                                └────────────────────────────┘
```

## Request Flow Examples

### 1. Loading Homepage
```
User → https://your-app.vercel.app/
  ↓
Vercel Edge Network
  ↓
Serves: frontend/build/index.html (from CDN cache)
  ↓
Browser loads React app
```

### 2. User Login
```
User → Submits login form
  ↓
Frontend → POST https://your-app.vercel.app/api/auth/login
  ↓
Vercel Routes → api/index.js (Serverless Function)
  ↓
Express Backend → authController.login()
  ↓
MongoDB Atlas → Verify credentials
  ↓
Returns JWT token
  ↓
Frontend stores token in localStorage
```

### 3. Document Request
```
User → Submits document request with file
  ↓
Frontend → POST /api/documents/request (multipart/form-data)
  ↓
api/index.js → Express → documentController
  ↓
Multer processes file upload (temporary storage)
  ↓
MongoDB Atlas → Save request metadata
  ↓
Return success response
```

### 4. OCR Processing (if implemented)
```
Admin → Upload document for OCR
  ↓
Frontend → POST /api/ocr
  ↓
Vercel Routes → api/ocr.py (Python Serverless Function)
  ↓
Pytesseract processes image
  ↓
Returns extracted text
  ↓
Frontend displays results
```

## File Structure in Vercel

```
your-vercel-deployment/
│
├── frontend/build/              # Static files (served by CDN)
│   ├── index.html
│   ├── static/
│   │   ├── js/
│   │   ├── css/
│   │   └── media/
│   ├── favicon.png
│   └── manifest.json
│
├── api/                         # Serverless functions
│   ├── index.js                 # Main API (Node.js)
│   ├── ocr.py                   # OCR endpoint (Python)
│   └── requirements.txt         # Python deps
│
└── backend/                     # Backend code (used by api/index.js)
    ├── server.js                # Express app (exported)
    ├── models/
    ├── controllers/
    ├── routes/
    ├── middleware/
    └── utils/
```

## Environment & Secrets

```
┌──────────────────────────────────────────────────────────┐
│         VERCEL ENVIRONMENT VARIABLES (Encrypted)          │
├──────────────────────────────────────────────────────────┤
│  • MONGODB_URI                                            │
│  • JWT_SECRET                                             │
│  • EMAIL_USER, EMAIL_PASS                                 │
│  • OPENAI_API_KEY                                         │
│  • NODE_ENV=production                                    │
└──────────────────────────────┬───────────────────────────┘
                               │
                               ▼
            Injected into Serverless Functions at runtime
```

## Serverless Function Lifecycle

```
1. Request arrives → /api/documents/request
                      ↓
2. Vercel provisions → Cold start (first time) ~500ms
   container          → Warm start (subsequent) ~50ms
                      ↓
3. Load function   → Require api/index.js
                      ↓
4. Load backend    → Require backend/server.js
                      ↓
5. Execute code    → Process request
                      ↓
6. Return response → Close connection
                      ↓
7. Container kept warm for ~5 minutes
```

## Deployment Pipeline

```
Developer Workflow:
┌──────────────────────────────────────────────────────────┐
│  1. Code changes locally                                  │
│  2. git add . && git commit -m "message"                  │
│  3. git push origin main                                  │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                 GITHUB REPOSITORY                         │
│              (Webhook triggers Vercel)                    │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                   VERCEL BUILD SYSTEM                     │
│                                                           │
│  1. Clone repository                                      │
│  2. Install dependencies (npm install)                    │
│  3. Run: npm run vercel-build                             │
│     ├─ Install backend deps                               │
│     ├─ Install frontend deps                              │
│     └─ Build React app (npm run build)                    │
│  4. Create serverless functions from api/                 │
│  5. Deploy to CDN (frontend) and Edge (API)               │
│  6. Assign domain                                         │
└──────────────────────────┬───────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────┐
│                    LIVE DEPLOYMENT                        │
│              https://your-app.vercel.app                  │
│                   (Auto-HTTPS, Global)                    │
└──────────────────────────────────────────────────────────┘
```

## Scaling Behavior

```
Traffic Level:        Vercel Response:
─────────────────────────────────────────────────────
Low  (1-10 req/s)  → Single function instance
Med  (10-100 req/s)→ 2-5 instances (auto-scale)
High (100+ req/s)  → 10+ instances (auto-scale)
Spike              → Instant scale to demand
```

## Cost Structure (Vercel Hobby - Free)

```
✅ Included Free:
├─ 100 GB Bandwidth/month
├─ 100 GB-Hours Serverless execution
├─ Unlimited static requests (CDN)
├─ 6,000 build minutes/month
└─ SSL certificates (auto)

⚠️ Limits:
├─ 10 second max execution time
├─ 1024 MB max function memory
└─ 4.5 MB max request/response size
```

## Monitoring Points

```
┌─────────────────────────────────────────────────────────┐
│                   MONITORING LAYERS                      │
├─────────────────────────────────────────────────────────┤
│  1. Vercel Dashboard                                     │
│     └─ Deployment logs, function logs, analytics        │
│                                                          │
│  2. MongoDB Atlas                                        │
│     └─ Query performance, connection stats              │
│                                                          │
│  3. Application Logs                                     │
│     └─ Console.log in function logs                     │
│                                                          │
│  4. Browser Console                                      │
│     └─ Frontend errors, network requests                │
└─────────────────────────────────────────────────────────┘
```

## Key Differences: Local vs Production

| Aspect            | Local Development           | Vercel Production          |
|-------------------|----------------------------|----------------------------|
| Frontend Server   | :3000 (webpack dev server) | CDN (edge locations)       |
| Backend Server    | :5000 (always running)     | Serverless (on-demand)     |
| File Storage      | Disk (persistent)          | Ephemeral (temporary)      |
| Database          | Local MongoDB              | MongoDB Atlas (cloud)      |
| Environment       | .env file                  | Vercel env variables       |
| CORS              | localhost:3000             | your-app.vercel.app        |
| Startup           | Manual npm start           | Automatic on request       |
| Scaling           | Single instance            | Auto-scales infinitely     |

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│  HTTPS (TLS 1.3)                  ← Vercel Auto          │
│  ────────────────────────────────────────────────────   │
│  CORS Policy                      ← Your config          │
│  ────────────────────────────────────────────────────   │
│  JWT Authentication               ← Your middleware      │
│  ────────────────────────────────────────────────────   │
│  MongoDB Atlas Access Control     ← IP whitelist + user  │
│  ────────────────────────────────────────────────────   │
│  Environment Variables Encryption ← Vercel secure vault  │
└─────────────────────────────────────────────────────────┘
```

This architecture provides:
- ✅ Automatic scaling
- ✅ Global performance
- ✅ Zero server management
- ✅ Built-in SSL/HTTPS
- ✅ Continuous deployment
- ✅ High availability
