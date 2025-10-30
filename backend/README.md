# Backend - MERN Machine Test (Express + MongoDB)

## Setup
1. Copy `.env.example` to `.env` and fill values:
   - MONGO_URI
   - JWT_SECRET
   - PORT (optional)

2. Install dependencies:
   ```
   cd backend
   npm install
   ```

3. Start server:
   ```
   npm run dev
   # or
   npm start
   ```

## Endpoints
- POST /api/auth/register  (register admin) - body: { name, email, password }
- POST /api/auth/login     (login) - body: { email, password }
- GET /api/agents          (list agents) - Authorization: Bearer <token>
- POST /api/agents         (add agent) - Authorization: Bearer <token> - body: { name, email, mobile, password }
- POST /api/upload         (upload csv/xlsx) - form-data file field `file` - Authorization: Bearer <token>
- GET /api/upload          (get distributed lists) - Authorization: Bearer <token>

Notes:
- The register endpoint is intentionally simple for testing. In production, secure it or create the admin manually.
