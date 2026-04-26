# SMTBMS - Smart Material Tracking & Business Management System

A comprehensive MERN stack application for managing inventory, human resources, sales, and enterprise operations.

## 🚀 Technology Stack
- **Frontend**: React.js, Tailwind CSS, Redux Toolkit, Lucide Icons, Recharts
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose)
- **Real-time**: Socket.io
- **Deployment Ready**: Vite, Vercel/Render support

## 📂 Project Structure
- `backend/`: Express server, MongoDB models, and business logic.
- `frontend/`: React application with modern UI components.

## 🛠 Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` and add your MongoDB Atlas URI.
4. Start the server: `npm start`

### 2. Frontend Setup
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## 🔐 Environment Variables
Required variables for the backend:
- `MONGO_URI`: Your MongoDB Atlas connection string
- `JWT_SECRET`: Secret key for authentication
- `PORT`: Server port (default: 5000)

## 📸 Features
- **Admin Dashboard**: Real-time analytics and command center.
- **Inventory Management**: Stock tracking, low stock alerts, and material requests.
- **HRMS**: Employee hub, attendance matrix, and payroll engine.
- **CRM**: Lead management, business deals, and support tickets.
- **Customer Portal**: Order tracking and product catalog.

---
Built with ❤️ for Enterprise Efficiency.
