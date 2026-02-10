# Implementation Plan: Rewards and Cashback Application

**Branch**: `001-rewards-cashback-app` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-rewards-cashback-app/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a Rewards and Cashback application that allows users to view their balance, review transaction history grouped by month, and withdraw funds to linked bank accounts. The application includes duplicate withdrawal prevention logic to prevent accidental repeat withdrawals within a 5-minute window.

**Technical Approach**: React frontend with Tailwind CSS and Context/Zustand for state management, Node.js/Express backend with RESTful API, SQLite or JSON for data persistence, and Vitest/React Testing Library for testing.

## Technical Context

**Language/Version**:
- Frontend: JavaScript/TypeScript with React 18+
- Backend: Node.js 18+ with Express 4.x

**Primary Dependencies**:
- Frontend: React 18+, Tailwind CSS 3.x, React Context API or Zustand, React Router
- Backend: Express 4.x, better-sqlite3 (if SQLite) or fs-extra (if JSON), cors, express-validator
- Testing: Vitest, React Testing Library, Supertest (for API testing)

**Storage**: SQLite database or JSON file storage (decision to be made in research phase based on scalability needs)

**Testing**:
- Unit tests: Vitest for business logic and utilities
- Component tests: React Testing Library for UI components
- API tests: Supertest for endpoint testing

**Target Platform**: Web application (modern browsers: Chrome, Firefox, Safari, Edge - last 2 versions)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- Dashboard loads within 2 seconds
- API responses under 500ms for typical operations
- Withdrawal flow completes in under 60 seconds (user interaction time)

**Constraints**:
- Must prevent negative balances (server-side validation)
- Must handle concurrent withdrawal requests safely
- Must maintain data integrity across sessions
- Duplicate withdrawal check must be server-side (not session-dependent)

**Scale/Scope**:
- Single user application (or small user base)
- ~4-6 React components
- ~4 API endpoints
- ~4 database tables/entities
- Expected transaction volume: <10,000 transactions per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Required Principles

| Principle | Status | Evidence |
|-----------|--------|----------|
| **I. React-First Frontend** | ✅ PASS | Frontend uses React 18+ with functional components, hooks (useState, useContext/Zustand), and follows React best practices |
| **II. API-Driven Backend** | ✅ PASS | Backend exposes RESTful API with 4 documented endpoints (GET /api/user/profile, GET /api/transactions, GET /api/withdrawal-methods, POST /api/withdrawals) with proper HTTP status codes and error responses |
| **III. Flexible Persistence** | ✅ PASS | Using SQLite or JSON (both allowed by constitution). Schema documented in data-model.md, supports all CRUD operations |
| **IV. Pragmatic Testing** | ✅ PASS | Vitest for business logic unit tests, React Testing Library for component tests, Supertest for API endpoint tests - focused on critical paths |
| **V. SOLID & Clean Code** | ✅ PASS | Plan follows separation of concerns (models/services/api/components), single responsibility principle, and meaningful naming conventions |

### ✅ Domain Model Alignment

| Entity | Constitution Definition | Implementation Status |
|--------|------------------------|----------------------|
| **User** | Rewards account holder with balance, withdrawal methods, transaction history | ✅ Aligned - User model with balance calculation |
| **Transaction** | Record of balance changes (cashback, referral_bonus, withdrawal) with amount, timestamp, description | ✅ Aligned - Transaction model with type, amount, timestamp |
| **WithdrawalMethod** | Linked bank account with masked account number and type | ✅ Aligned - WithdrawalMethod model with account masking |
| **Withdrawal** | Fund transfer request with method reference, amount, status, timestamps | ✅ Aligned - Withdrawal model with status tracking |

### ✅ UX Requirements

| Requirement | Implementation |
|-------------|----------------|
| Loading states | React loading states for all async operations (API calls) |
| Clear error messages | User-friendly error messages with appropriate HTTP status codes |
| Visual feedback | Button states, transitions, success/error notifications |
| Responsive design | Tailwind CSS with responsive utilities following Figma specs |

**Constitution Check Result**: ✅ **PASSED** - All principles satisfied, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/001-rewards-cashback-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── api-spec.yaml    # OpenAPI 3.0 specification
│   └── README.md        # Contract documentation
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # Data models (User, Transaction, WithdrawalMethod, Withdrawal)
│   ├── services/        # Business logic (balance calculation, duplicate detection)
│   ├── api/             # Express routes and controllers
│   │   ├── routes/      # Route definitions
│   │   ├── controllers/ # Request handlers
│   │   └── middleware/  # Validation, error handling
│   ├── db/              # Database connection and migrations (SQLite) or file utils (JSON)
│   └── server.js        # Express app entry point
├── tests/
│   ├── unit/            # Service and utility tests
│   ├── integration/     # API endpoint tests
│   └── fixtures/        # Test data
├── package.json
└── vitest.config.js

frontend/
├── src/
│   ├── components/      # React components
│   │   ├── Dashboard.jsx              # Main dashboard view
│   │   ├── TransactionList.jsx        # Transaction history with month grouping
│   │   ├── WithdrawalFlow.jsx         # Withdrawal wizard
│   │   ├── WithdrawalMethodSelect.jsx # Bank account selector
│   │   ├── WithdrawalConfirm.jsx      # Confirmation screen
│   │   └── common/                    # Shared UI components (Button, Card, etc.)
│   ├── context/         # React Context or Zustand stores
│   │   └── UserContext.jsx   # User state (balance, transactions)
│   ├── services/        # API client functions
│   │   └── api.js       # HTTP client with endpoint functions
│   ├── utils/           # Helper functions (date formatting, currency formatting)
│   ├── App.jsx          # Root component with routing
│   ├── main.jsx         # Entry point
│   └── index.css        # Tailwind imports
├── tests/
│   ├── components/      # Component tests with React Testing Library
│   └── utils/           # Utility function tests
├── package.json
├── vite.config.js
├── vitest.config.js
└── tailwind.config.js

shared/
└── types/               # TypeScript types (if using TS) or JSDoc types
    └── models.js        # Shared type definitions
```

**Structure Decision**: Web application structure (Option 2) selected because the feature requires both a React frontend for the UI and a Node.js/Express backend for the RESTful API. The frontend and backend are completely decoupled and communicate via the documented API contracts. A `shared/` directory is included for type definitions to ensure consistency between frontend and backend.

## Complexity Tracking

No violations of constitution principles. This section is not applicable.

---

## Phase 0: Research & Decision Documentation

**Status**: ✅ Complete

### Research Tasks

1. **Storage Decision: SQLite vs JSON**
   - Evaluate: Concurrent access, performance, query complexity, deployment simplicity
   - Document: Pros/cons of each approach for this use case
   - Decide: Which storage mechanism to use

2. **State Management: React Context vs Zustand**
   - Evaluate: Simplicity, performance, bundle size, DevTools support
   - Document: When to use each approach
   - Decide: Which state management solution fits best

3. **Duplicate Withdrawal Detection Pattern**
   - Research: Best practices for duplicate request detection in distributed systems
   - Evaluate: Time-window approaches, idempotency keys, database constraints
   - Document: Chosen pattern and implementation strategy

4. **API Error Handling Patterns**
   - Research: Standard error response formats, HTTP status codes for different scenarios
   - Document: Error response schema, validation error formats
   - Decide: Error handling middleware structure

5. **Transaction Grouping by Month**
   - Research: Client-side vs server-side grouping, SQL GROUP BY vs application logic
   - Evaluate: Performance trade-offs, code maintainability
   - Document: Implementation approach for month grouping

**Output**: `research.md` with decisions, rationale, and alternatives considered for each task

---

## Phase 1: Design Artifacts

**Status**: ✅ Complete

### Artifacts to Generate

1. **data-model.md**
   - Entity definitions with fields, types, validations
   - Relationships between entities
   - State transition diagrams (for Withdrawal status)
   - Database schema (SQL DDL or JSON structure)

2. **contracts/api-spec.yaml**
   - OpenAPI 3.0 specification for all 4 endpoints
   - Request/response schemas
   - Error response formats
   - Example payloads

3. **contracts/README.md**
   - API usage guide
   - Authentication requirements (if any)
   - Error handling documentation
   - Example cURL commands

4. **quickstart.md**
   - Development environment setup
   - How to run backend (install deps, start server)
   - How to run frontend (install deps, start dev server)
   - How to run tests
   - Sample data for testing

### Agent Context Update

After generating design artifacts, update agent-specific context:

```bash
.specify/scripts/bash/update-agent-context.sh claude
```

This will add the current technology stack to `.claude/CLAUDE.md` or appropriate agent context file.

---

## Next Steps

1. ✅ **Complete**: Constitution check passed
2. ✅ **Complete**: Phase 0 research tasks → generated `research.md`
3. ✅ **Complete**: Phase 1 design → generated `data-model.md`, `contracts/`, `quickstart.md`
4. ✅ **Complete**: Agent context updated with technology stack
5. 🎯 **Ready**: Run `/speckit.tasks` to generate `tasks.md` with actionable implementation tasks
6. ⏳ **After tasks**: Run `/speckit.implement` to execute tasks

**Planning Phase Status**: ✅ **COMPLETE** - Ready for task generation
