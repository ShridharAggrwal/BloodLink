# BloodLink - Blood Donation Management System

A full-stack web application connecting blood donors with recipients through real-time alerts and location-based matching.

## 🚀 Live Demo

**Deployment Status:** Ready for production deployment

**Quick Deploy:**
- Backend: Render (PostgreSQL + Node.js)
- Frontend: Vercel (React + Vite)
- Email: Gmail SMTP with App Password
- Cost: $0/month (free tiers)

📖 **Deployment Guides:**
- 📘 [Full Deployment Guide](DEPLOYMENT.md) - Step-by-step instructions
- ⚡ [Quick Deploy Reference](QUICK_DEPLOY.md) - 30-minute deployment
- 📝 [Environment Setup](ENV_SETUP.md) - Configure `.env` files

## Features

- **User Dashboard**: Request blood, donate, view history, see nearby campaigns/blood banks
- **Admin Dashboard**: Manage users, NGOs, blood banks, generate signup tokens
- **NGO Dashboard**: Create campaigns, request blood, manage volunteers
- **Blood Bank Dashboard**: Manage blood stock, view/fulfill requests

### Key Highlights
- Real-time alerts via Socket.io when blood is requested
- Location-based matching using PostGIS (35km radius)
- Email verification for users
- One-time signup tokens for NGOs and Blood Banks

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL + PostGIS
- Socket.io (real-time)
- Nodemailer (emails)
- JWT Authentication

### Frontend
- React 18
- Tailwind CSS
- React Router v6
- Socket.io Client

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- Gmail account for sending emails (or any SMTP server)

## Setup Instructions

### 1. Database Setup

```bash
# Create database
createdb bloodlink

# Enable PostGIS extension (run in psql)
psql -d bloodlink -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env  # Or create manually with the following content:
```

Create `/backend/.env` with:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bloodlink
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

FRONTEND_URL=http://localhost:5173
```

**Note for Gmail**: Enable 2FA and create an App Password at https://myaccount.google.com/apppasswords

```bash
# Initialize database tables
npm run db:init

# Seed admin user
node config/seedAdmin.js

# Start server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Default Admin Login
- Email: `admin@bloodlink.com`
- Password: `admin123`

## Usage Flow

### For Users
1. Register at `/register`
2. Verify email via link sent to inbox
3. Login and access dashboard
4. Request blood or respond to alerts

### For Admin
1. Login with admin credentials
2. Generate signup tokens for NGOs/Blood Banks
3. Share the generated link with organizations
4. Approve pending registrations

### For NGOs/Blood Banks
1. Use the signup link provided by admin
2. Complete registration
3. Access respective dashboard

## API Endpoints

### Auth
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Login (all roles)
- `GET /api/auth/verify/:token` - Email verification
- `POST /api/auth/register/ngo/:token` - NGO registration
- `POST /api/auth/register/blood-bank/:token` - Blood Bank registration

### Blood Requests
- `POST /api/blood-requests` - Create request (sends alerts to users in 35km)
- `GET /api/blood-requests/alerts` - Get nearby active requests
- `PUT /api/blood-requests/:id/accept` - Accept a request

### Public Stats
- `GET /api/stats` - Get homepage statistics

## Project Structure

```
BloodLink/
├── backend/
│   ├── config/           # Database & initialization
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth & role check
│   ├── routes/           # API routes
│   ├── services/         # Email, geocoding, socket
│   ├── utils/            # Helper functions
│   ├── app.js           # Express app
│   └── server.js        # Entry point
│
└── frontend/
    ├── public/
    └── src/
        ├── components/   # Reusable UI components
        ├── context/      # Auth & Socket contexts
        ├── pages/        # Page components
        ├── services/     # API service
        ├── App.jsx
        └── main.jsx
```

## Environment Variables

### Backend (.env)
| Variable | Description |
|----------|-------------|
| PORT | Server port (default: 5000) |
| DB_HOST | PostgreSQL host |
| DB_PORT | PostgreSQL port |
| DB_NAME | Database name |
| DB_USER | Database user |
| DB_PASSWORD | Database password |
| JWT_SECRET | Secret for JWT signing |
| JWT_EXPIRES_IN | Token expiry (e.g., 7d) |
| EMAIL_HOST | SMTP host |
| EMAIL_PORT | SMTP port |
| EMAIL_USER | SMTP username |
| EMAIL_PASS | SMTP password/app password |
| FRONTEND_URL | Frontend URL for links |

## License

MIT License - Feel free to use for your college project!

