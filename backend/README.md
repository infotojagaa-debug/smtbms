# SMTBMS - Smart Material Tracking and Business Management System

The SMTBMS is a comprehensive, mission-critical, enterprise-grade software suite designed to unify Material Tracking (Inventory), Human Resources (HRMS), Enterprise Resource Planning (ERP), and Customer Relationship Management (CRM) into a highly cohesive, real-time platform.

Constructed on the MERN stack (MongoDB, Express.js, React.js, Node.js) with Socket.io for real-time asynchronous synchronization, the SMTBMS implements enterprise-level security paradigms and Role-Based Access Controls (Admin, HR, Manager, Sales, Employee).

## 🚀 Architectural Features

* **Centralized Data Intelligence**: Multi-module aggregations orchestrate macro and micro enterprise metrics across specific KPI dashboards.
* **Socket.io Synchronization**: Complete Real-time Nervous System featuring persistent connectivity, cross-module notifications, and stakeholder presence matrices.
* **Forensic Immutable Ledger**: Automated middleware capturing high-fidelity `Pre` vs `Post` JSON data diffs on all state-modifying requests.
* **Industrial Cybersecurity**: Integrated `helmet`, `xss-clean`, `mongo-sanitize`, `hpp` defenses, layered underneath robust rate-limiting.
* **Kanban Acquisition Flow**: Interactive Deal staging interface with seamless real-time recalculations.

---

## 🛠️ Step 1 — Local Environment Initialization

### Prerequisites
- Node.js (v18+ Recommended)
- MongoDB Atlas Account (or Local MongoDB Server)
- Cloudinary Account (For artifacts & profiles)

### Component Dependencies

1. **Clone the repository and initialize Backend Node**:
    ```bash
    cd backend
    npm install
    npm install --save-dev jest supertest mongodb-memory-server
    ```

2. **Initialize Frontend Node**:
    ```bash
    cd frontend
    npm install
    npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event msw
    ```

---

## ⚙️ Step 2 — Environment Variables Config

### Backend Configuration (`backend/.env`)
Copy the `backend/.env.example` file to create a `.env` file within the `backend/` directory:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
MONGO_URI=your_mongodb_cluster_string
JWT_SECRET=generate_a_secure_minimum_32_char_key
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend Configuration (`frontend/.env`)
Copy the `frontend/.env.example` file to create a `.env` file within the `frontend/` directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🧪 Step 3 — Quality Assurance Auditing

The system utilizes robust automated testing parameters. Execute these from their respective module directories:

### Backend Tests (Jest / Supertest)
```bash
cd backend
npm test
```
*Evaluates Auth RBAC, Ledger Flux, Fiscal calculations, CRM Node synchronization, and Socket.io multi-casting capabilities.*

### Frontend Tests (React Testing Library / MSW)
```bash
cd frontend
npm test
```
*Evaluates Component Rendering state, Redux data hydration, Kanban pillar logic, and UI failure thresholds.*

### Postman API Verification
Import `SMTBMS.postman_collection.json` into Postman to engage with the complete backend matrix during live operations.

---

## 🌍 Step 4 — Server Genesis & Data Hydration

### Starting the Operations Nodes Locally
```bash
# Terminal 1 - Backend
cd backend
node server.js

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Populating Test Artifacts
With the backend server actively listening, execute the seed protocol in a separate terminal:
```bash
cd backend
node scripts/seedDatabase.js
```
*This establishes synthetic CRM customers, material variants, and hierarchal users.*

---

## 🚀 Step 5 — Production Deployment Strategy

The architecture is configured for zero-friction deployments on modern cloud gateways.

### Database (MongoDB Atlas)
1. Initialize an **M0 Cluster** in MongoDB Atlas.
2. Formulate database: `smtbms_production`.
3. Establish user credentials.
4. Set IP Whitelist: `0.0.0.0/0`.
5. Procure connection URI.

### Backend Routing (Render.com)
1. Commit backend hierarchy to a GitHub Repository.
2. Initialize **Web Service** on Render, point to repository.
3. Configure settings: 
    * Build: `npm install`
    * Start: `node server.js`
4. Incorporate environment variables from `.env`.
5. Deploy and procure robust API URL (`https://smtbms-backend.onrender.com`).

### Frontend Delivery (Vercel)
1. Commit frontend hierarchy to GitHub Repository.
2. Import project via Vercel dashboard. (Framework: Create React App/Vite).
3. Set environment variable `REACT_APP_API_URL` to your Render API URL.
4. Deploy and procure Client URL (`https://smtbms.vercel.app`).
5. **CRITICAL:** Re-access Render Settings and update `CLIENT_URL` to this Vercel address to satisfy CORS protocols. Redeploy Backend.

### Enterprise Genesis Node Setup
After deployment completion, you MUST construct the primary executive credentials manually via server terminal/script:
```bash
node scripts/createAdmin.js
```
**Default Credentials generated by script**:
- **Email**: `admin@smtbms.com`
- **Password**: `Admin@123`
- *Requires immediate permutation payload upon successful portal access.*

---

## 🛡️ Operational Checklists Completed

✅ **Industrial Hardening**: `xss-clean`, `express-rate-limit`, `helmet`, `mongo-sanitize` logic.
✅ **Performance Tuning**: Applied robust indexing architecture across MongoDB. Client-side code splitting prepared (`React.lazy`).
✅ **Secure Lifecycle Operations**: Short-lived TTL indexes deployed for Audit/Notification purging. Bcrypt 12-round architectural salting.

*The Enterprise is operational.*
