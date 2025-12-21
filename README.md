# JobBoard

A full-stack job board application for students and recruiters, built with React, Node.js, and PostgreSQL.

## Features

- **Students can:**
  - Browse and search job listings
  - Apply to jobs with resume upload
  - Track application status
  - Manage profile

- **Recruiters can:**
  - Post and manage job listings
  - Review applications
  - Track candidates
  - Manage company profile

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Hot Toast
- Lucide Icons

### Backend
- Node.js + Express
- PostgreSQL
- JWT Authentication
- bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/job-board.git
   cd job-board
   ```

2. **Set up the server**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your database credentials
   npm install
   ```

3. **Set up the client**
   ```bash
   cd ../client
   npm install
   ```

4. **Start PostgreSQL and create database**
   ```sql
   CREATE DATABASE jobboard;
   ```

5. **Run the application**
   
   Terminal 1 (Server):
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 (Client):
   ```bash
   cd client
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
job-board/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── types/          # TypeScript types
│   └── ...
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database & config
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utility functions
│   └── ...
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Jobs (Coming Soon)
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create job (recruiter only)
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job (recruiter only)
- `DELETE /api/jobs/:id` - Delete job (recruiter only)

### Applications (Coming Soon)
- `POST /api/jobs/:id/apply` - Apply to job (student only)
- `GET /api/applications` - Get user's applications
- `PUT /api/applications/:id` - Update application status

## Deployment

### Railway (Recommended)
1. Push code to GitHub
2. Connect Railway to your repo
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy!

## License

MIT
