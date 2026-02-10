# Quickstart Guide

**Feature**: Rewards and Cashback Application
**Branch**: `001-rewards-cashback-app`
**Last Updated**: 2026-02-08

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn**: Comes with Node.js
- **Git**: For cloning and version control ([Download](https://git-scm.com/))
- **Code Editor**: VS Code, Sublime, or your preferred editor

**Verify installations**:
```bash
node --version    # Should show v18.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show 2.x.x or higher
```

---

## Project Structure

```text
kiwi-challenge-1/
├── backend/              # Node.js/Express API
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── data/             # SQLite database file (created on first run)
├── frontend/             # React UI
│   ├── src/
│   ├── tests/
│   ├── package.json
│   └── public/
└── specs/                # Design documentation
    └── 001-rewards-cashback-app/
```

---

## Setup Instructions

### 1. Clone Repository and Checkout Branch

```bash
# Clone the repository (if not already cloned)
git clone <repository-url>
cd kiwi-challenge-1

# Checkout the feature branch
git checkout 001-rewards-cashback-app
```

---

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

**Key dependencies installed**:
- `express` - Web framework
- `better-sqlite3` - SQLite database driver
- `express-validator` - Request validation
- `cors` - CORS middleware
- `vitest` - Testing framework
- `supertest` - API testing

#### Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# backend/.env
PORT=3000
NODE_ENV=development
DATABASE_PATH=./data/rewards.db
```

**Environment Variables**:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Backend server port |
| `NODE_ENV` | development | Environment (development/production) |
| `DATABASE_PATH` | ./data/rewards.db | Path to SQLite database file |

#### Initialize Database

The database will be automatically created on first run with schema and seed data.

```bash
npm run db:init
```

**Manual initialization** (if needed):
```bash
# Run migrations
npm run db:migrate

# Seed sample data
npm run db:seed
```

#### Start Backend Server

```bash
npm run dev
```

**Expected output**:
```text
✅ Database initialized: ./data/rewards.db
✅ Applied migration 001_initial_schema
✅ Seeded test user (ID: 1)
🚀 Server running on http://localhost:3000
```

**Verify backend is running**:
```bash
curl http://localhost:3000/api/user/profile
```

**Expected response**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "balance": 121.25,
      "created_at": "2026-02-08T10:00:00Z"
    }
  }
}
```

---

### 3. Frontend Setup

#### Install Dependencies

Open a **new terminal** (keep backend running) and navigate to frontend:

```bash
cd frontend
npm install
```

**Key dependencies installed**:
- `react` - UI library
- `react-router-dom` - Client-side routing
- `tailwindcss` - CSS framework
- `vite` - Build tool
- `vitest` - Testing framework
- `@testing-library/react` - Component testing

#### Environment Configuration

Create a `.env` file in the `frontend/` directory:

```bash
# frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api
```

**Environment Variables**:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | http://localhost:3000/api | Backend API base URL |

#### Start Frontend Dev Server

```bash
npm run dev
```

**Expected output**:
```text
VITE v5.0.0 ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Open in browser**: [http://localhost:5173](http://localhost:5173)

---

## Verifying the Setup

### Backend Health Check

With backend running on port 3000:

```bash
# Test user profile endpoint
curl http://localhost:3000/api/user/profile

# Test transactions endpoint
curl http://localhost:3000/api/transactions

# Test withdrawal methods endpoint
curl http://localhost:3000/api/withdrawal-methods
```

All should return JSON responses with `"success": true`.

---

### Frontend Visual Check

Open [http://localhost:5173](http://localhost:5173) in your browser.

**You should see**:
1. ✅ Dashboard with balance displayed (e.g., "$121.25")
2. ✅ Transaction history grouped by month
3. ✅ Withdrawal button to initiate withdrawal flow

**If you see errors**:
- Check browser console for API errors
- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in frontend `.env` file

---

## Running Tests

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode (re-run on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test Structure**:
```text
backend/tests/
├── unit/
│   ├── services/
│   │   ├── balanceService.test.js
│   │   └── duplicateDetection.test.js
│   └── utils/
│       └── formatting.test.js
└── integration/
    ├── userProfile.test.js
    ├── transactions.test.js
    ├── withdrawalMethods.test.js
    └── withdrawals.test.js
```

**Expected output**:
```text
✓ backend/tests/unit/services/balanceService.test.js (3)
✓ backend/tests/integration/withdrawals.test.js (8)

Test Files  12 passed (12)
     Tests  45 passed (45)
```

---

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test Structure**:
```text
frontend/tests/
├── components/
│   ├── Dashboard.test.jsx
│   ├── TransactionList.test.jsx
│   ├── WithdrawalFlow.test.jsx
│   └── WithdrawalConfirm.test.jsx
└── utils/
    ├── groupByMonth.test.js
    └── formatCurrency.test.js
```

**Expected output**:
```text
✓ frontend/tests/components/Dashboard.test.jsx (5)
✓ frontend/tests/components/TransactionList.test.jsx (7)

Test Files  8 passed (8)
     Tests  28 passed (28)
```

---

## Sample Data

The database is seeded with a test user and sample transactions:

**Test User**:
- **Name**: John Doe
- **Email**: john.doe@example.com
- **Initial Balance**: $121.25

**Sample Transactions**:
- Cashback: +$25.50, +$15.75, +$30.00
- Referral Bonuses: +$50.00, +$50.00
- Withdrawal: -$50.00

**Withdrawal Methods**:
- Chase Bank - Checking (****7890)
- Bank of America - Savings (****3210)

---

## Development Workflow

### Typical Development Session

1. **Start backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

2. **Start frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Run tests on file changes** (Terminal 3 - optional):
   ```bash
   cd backend
   npm run test:watch
   ```

4. **Open browser**: [http://localhost:5173](http://localhost:5173)

5. **Make code changes** → See live updates in browser (Vite hot reload)

---

### Common Development Tasks

#### Add a New API Endpoint

1. Define route in `backend/src/api/routes/`
2. Create controller in `backend/src/api/controllers/`
3. Add validation middleware if needed
4. Write integration test in `backend/tests/integration/`
5. Update OpenAPI spec: `specs/001-rewards-cashback-app/contracts/api-spec.yaml`

#### Add a New React Component

1. Create component in `frontend/src/components/`
2. Import and use in parent component or page
3. Write test in `frontend/tests/components/`
4. Add styles with Tailwind CSS classes

#### Reset Database to Seed Data

```bash
cd backend
rm data/rewards.db
npm run db:init
```

---

## Troubleshooting

### Backend Won't Start

**Symptom**: `Error: EADDRINUSE: address already in use :::3000`

**Solution**: Port 3000 is already in use.

```bash
# Find process using port 3000 (macOS/Linux)
lsof -i :3000

# Find process using port 3000 (Windows)
netstat -ano | findstr :3000

# Kill the process or change PORT in backend/.env
```

---

### Database Errors

**Symptom**: `Error: SQLITE_ERROR: no such table: users`

**Solution**: Database not initialized.

```bash
cd backend
npm run db:init
```

**Symptom**: `Error: SQLITE_READONLY: attempt to write a readonly database`

**Solution**: Database file permissions issue.

```bash
chmod 644 backend/data/rewards.db
```

---

### Frontend API Errors

**Symptom**: `Network Error` or `Failed to fetch` in browser console

**Solution**:
1. Verify backend is running on port 3000
2. Check CORS is enabled in backend (should be by default)
3. Verify `VITE_API_BASE_URL` in `frontend/.env`

**Debug API calls**:
```javascript
// Add to frontend/src/services/api.js
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
```

---

### Tests Failing

**Symptom**: Tests fail with database errors

**Solution**: Tests should use in-memory database (`:memory:`).

Verify `backend/tests/setup.js`:
```javascript
const db = new Database(':memory:'); // Not file path
```

---

## Additional Resources

- **API Documentation**: [contracts/README.md](./contracts/README.md)
- **Data Model**: [data-model.md](./data-model.md)
- **OpenAPI Spec**: [contracts/api-spec.yaml](./contracts/api-spec.yaml)
- **Implementation Plan**: [plan.md](./plan.md)
- **Technical Decisions**: [research.md](./research.md)

---

## Next Steps

After verifying the setup works:

1. **Review the Figma design** to understand UI requirements
2. **Run `/speckit.tasks`** to generate implementation tasks
3. **Run `/speckit.implement`** to execute tasks (or implement manually)
4. **Commit changes** frequently with descriptive messages

---

## Support

If you encounter issues not covered here:
1. Check the error message carefully
2. Search the issue tracker (if available)
3. Review the constitution: `.specify/memory/constitution.md`
4. Consult the plan: `plan.md`

**Common Commands Reference**:

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start dev server
npm test             # Run tests
npm run db:init      # Initialize database

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm test             # Run tests
npm run build        # Build for production
```

---

**Happy coding! 🚀**
