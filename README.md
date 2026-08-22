# Dayflow HRMS

Dayflow HRMS is a modern, full-stack Human Resource Management System.

## Project Structure

```
dayflow-hrms/
├── frontend/    # React + Vite + Tailwind CSS
├── backend/     # Node.js + Express + MongoDB REST API
├── docs/        # Documentation
├── .gitignore
└── README.md
```

## Setup & Running

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## API Health Check
- GET `http://localhost:5000/api/health`
