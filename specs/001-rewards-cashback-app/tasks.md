# Tasks: Rewards and Cashback Application

**Input**: Design documents from `/specs/001-rewards-cashback-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included — the specification explicitly requires Vitest for unit tests, React Testing Library for component tests, and Supertest for API tests (Constitution Principle IV: Pragmatic Testing).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- **Backend tests**: `backend/tests/`
- **Frontend tests**: `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic directory/dependency structure

- [x] T001 Create project directory structure per implementation plan: `backend/src/{models,services,api/{routes,controllers,middleware},db/{migrations}}`, `backend/tests/{unit/{models,services},integration,fixtures}`, `backend/data/`, `frontend/src/{components/common,context,services,utils}`, `frontend/tests/{components,utils}`
- [x] T002 Initialize backend Node.js project: create `backend/package.json` with scripts (dev, test, test:watch, test:coverage, db:init, db:migrate, db:seed) and install dependencies (express, better-sqlite3, cors, express-validator, uuid) and dev dependencies (vitest, supertest)
- [x] T003 [P] Initialize frontend Vite+React project: create `frontend/package.json` with scripts (dev, build, test, test:watch, test:coverage) and install dependencies (react, react-dom, react-router-dom) and dev dependencies (vite, @vitejs/plugin-react, vitest, jsdom, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event)
- [x] T004 [P] Configure Tailwind CSS for frontend: install tailwindcss, postcss, autoprefixer; create `frontend/tailwind.config.js`, `frontend/postcss.config.js`; add Tailwind directives to `frontend/src/index.css`

**Checkpoint**: Project scaffolded — both backend and frontend can be started (empty apps)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement SQLite database connection module in `backend/src/db/database.js`: export a function that opens/creates the SQLite database at `DATABASE_PATH` env var (default `./data/rewards.db`), enables foreign keys (`PRAGMA foreign_keys = ON`), and returns the `better-sqlite3` Database instance. Use singleton pattern so all imports share one connection
- [x] T006 [P] Create initial schema migration in `backend/src/db/migrations/001_initial_schema.sql`: include all CREATE TABLE statements for users, transactions, withdrawal_methods, withdrawals tables with constraints, CHECK clauses, foreign keys, and indexes (idx_transactions_user_timestamp, idx_transactions_duplicate_check) as defined in data-model.md
- [x] T007 Implement migration runner and seed script: create `backend/src/db/migrate.js` that reads SQL migration files and tracks applied versions in a `schema_migrations` table; create `backend/src/db/seed.js` that inserts the test user (John Doe), 2 withdrawal methods (Chase checking, BofA savings), 6 sample transactions (3 cashback, 2 referral_bonus, 1 withdrawal) per data-model.md seed data
- [x] T008 Setup Express server entry point in `backend/src/server.js`: configure CORS (allow frontend origin), JSON body parsing, request ID middleware (uuid), mount API routes under `/api`, register error handler as last middleware, start listening on PORT env var (default 3000)
- [x] T009 [P] Implement error handling middleware and custom error classes in `backend/src/api/middleware/errorHandler.js`: create AppError base class with code/status/details properties; create subclasses ValidationError (400), NotFoundError (404), ConflictError (409), BusinessLogicError (422); implement Express error handler that formats errors per the standard JSON error schema from contracts/README.md
- [x] T010 [P] Create frontend API client service in `frontend/src/services/api.js`: implement fetch wrapper with `VITE_API_BASE_URL` base URL, automatic JSON parsing, standard error extraction (parse error.code and error.message from response), and exported functions: `getUserProfile()`, `getTransactions(limit, offset, type)`, `getWithdrawalMethods()`, `createWithdrawal(methodId, amount, overrideDuplicateCheck)`
- [x] T011 [P] Create shared utility functions in `frontend/src/utils/formatters.js`: implement `formatCurrency(amount)` that formats a number as USD with 2 decimal places (e.g., `"$150.50"`), and `formatDate(isoString)` that formats ISO timestamp to readable local date/time string
- [x] T012 [P] Configure Vitest for backend and frontend: create `backend/vitest.config.js` with test environment setup (in-memory SQLite); create `frontend/vitest.config.js` with jsdom environment and @testing-library/jest-dom setup file; create `frontend/tests/setup.js` with jest-dom imports; create `backend/tests/fixtures/testDb.js` helper that creates in-memory database, runs migrations, and optionally seeds data

**Checkpoint**: Foundation ready — database works, server runs, API client configured, error handling in place. User story implementation can now begin

---

## Phase 3: User Story 1 - View Dashboard with Balance and Transaction History (Priority: P1) 🎯 MVP

**Goal**: Users can view their current rewards balance and transaction history grouped by month on a dashboard

**Independent Test**: Load dashboard → verify balance is displayed correctly, transactions appear grouped by month headers in descending order, empty state shows $0.00 with no-history message

### Implementation for User Story 1

#### Backend

- [x] T013 [P] [US1] Implement User model in `backend/src/models/user.js`: export `findById(id)` that returns user record, and `getBalance(userId)` that returns `COALESCE(SUM(amount), 0)` from transactions table. Include the SQL queries from data-model.md
- [x] T014 [P] [US1] Implement Transaction model in `backend/src/models/transaction.js`: export `findByUserId(userId, { limit, offset, type })` that returns paginated transactions sorted by timestamp DESC with optional type filter, and `countByUserId(userId, { type })` that returns total count for pagination
- [x] T015 [US1] Implement GET /api/user/profile route and controller: create `backend/src/api/controllers/userController.js` with `getProfile` handler that calls User.findById and User.getBalance, returns `{ success: true, data: { user: { id, name, email, balance, created_at } } }`; create `backend/src/api/routes/userRoutes.js` with Express Router mounting the endpoint
- [x] T016 [US1] Implement GET /api/transactions route and controller: create `backend/src/api/controllers/transactionController.js` with `getTransactions` handler that validates query params (limit 1-500 default 100, offset >=0, type optional enum), calls Transaction.findByUserId and countByUserId, returns `{ success: true, data: { transactions, total, balance } }`; create `backend/src/api/routes/transactionRoutes.js`
- [x] T017 [US1] Register US1 routes in Express app: update `backend/src/server.js` to mount userRoutes at `/api/user` and transactionRoutes at `/api`

#### Frontend

- [x] T018 [US1] Create UserContext provider in `frontend/src/context/UserContext.jsx`: implement React Context with `UserProvider` component that fetches user profile and transactions on mount via api.js functions; expose `useUser()` hook returning `{ user, balance, transactions, isLoading, error, refetch }`; handle loading and error states
- [x] T019 [P] [US1] Implement groupByMonth utility in `frontend/src/utils/groupByMonth.js`: export function that takes an array of transactions (sorted by timestamp DESC) and returns an ordered array of `{ month: "February 2026", transactions: [...] }` objects with most recent month first. Use `toLocaleDateString('en-US', { year: 'numeric', month: 'long' })` for month labels
- [x] T020 [US1] Create TransactionList component in `frontend/src/components/TransactionList.jsx`: accept transactions array prop; use groupByMonth utility to group transactions; render month headers (e.g., "February 2026") followed by transaction items showing type icon/label, description, amount (formatted with formatCurrency, green for credits, red for debits), and formatted timestamp. Show empty state message when no transactions exist
- [x] T021 [US1] Create Dashboard component in `frontend/src/components/Dashboard.jsx`: consume UserContext via useUser() hook; display balance card prominently at top showing formatted balance (e.g., "$150.50"); render TransactionList component below with transactions from context; show loading spinner when isLoading is true; show error message when error exists
- [x] T022 [US1] Setup App.jsx with routing and context in `frontend/src/App.jsx`: wrap app with UserProvider; configure React Router with "/" route rendering Dashboard; create `frontend/src/main.jsx` entry point rendering App into root DOM element with BrowserRouter

### Tests for User Story 1

- [x] T023 [P] [US1] Write backend unit tests in `backend/tests/unit/models/user.test.js` and `backend/tests/unit/models/transaction.test.js`: test User.findById returns user, User.getBalance calculates correct sum of credits and debits, Transaction.findByUserId returns paginated results sorted by timestamp DESC, Transaction.countByUserId returns correct count, type filter works correctly
- [x] T024 [P] [US1] Write backend integration tests in `backend/tests/integration/userProfile.test.js` and `backend/tests/integration/transactions.test.js`: test GET /api/user/profile returns 200 with user object and balance; test GET /api/transactions returns 200 with transactions array, total count, and balance; test pagination (limit/offset); test type filter; test empty user returns balance 0
- [x] T025 [P] [US1] Write frontend component tests in `frontend/tests/components/Dashboard.test.jsx`: test Dashboard renders balance correctly, test TransactionList groups transactions by month with correct headers, test loading state shows spinner, test error state shows error message, test empty state shows no-history message. Use React Testing Library with mocked UserContext
- [x] T026 [P] [US1] Write frontend utility test in `frontend/tests/utils/groupByMonth.test.js`: test groupByMonth correctly groups transactions spanning multiple months, handles single month, handles empty array, maintains descending month order, handles year boundaries

**Checkpoint**: Dashboard is fully functional — user can see balance and transaction history grouped by month. US1 is independently testable and delivers MVP value

---

## Phase 4: User Story 2 - Complete Withdrawal Flow (Priority: P2)

**Goal**: Users can withdraw rewards to a linked bank account by selecting a bank, entering an amount, confirming, and seeing a success message

**Independent Test**: Initiate withdrawal → select bank account → enter amount → confirm → verify success message and updated balance; also verify insufficient balance error

### Implementation for User Story 2

#### Backend

- [x] T027 [P] [US2] Implement WithdrawalMethod model in `backend/src/models/withdrawalMethod.js`: export `findByUserId(userId)` returning active methods only (`is_active = 1`), `findById(id)` returning single method. Include `maskAccountNumber(accountNumber)` helper that returns `****` + last 4 digits. Always return masked account numbers from find methods
- [x] T028 [P] [US2] Implement Withdrawal model in `backend/src/models/withdrawal.js`: export `create(userId, methodId, amount)` and `findById(id)`. The create function should use a database transaction to: (1) validate balance >= amount, (2) insert withdrawal record, (3) insert corresponding transaction with type='withdrawal' and negative amount and description "Withdrawal to [bank_name] ****[last4]", (4) link withdrawal to transaction, (5) update status to 'completed'
- [x] T029 [US2] Implement withdrawal service in `backend/src/services/withdrawalService.js`: export `processWithdrawal(userId, methodId, amount)` that validates: amount > 0 with max 2 decimal places (throw ValidationError), method exists and belongs to user (throw NotFoundError), balance >= amount (throw BusinessLogicError with INSUFFICIENT_BALANCE code and details `{ requested, available }`). On success, call Withdrawal.create and return withdrawal record with new balance
- [x] T030 [US2] Implement GET /api/withdrawal-methods route and controller: create `backend/src/api/controllers/withdrawalMethodController.js` with `getMethods` handler returning `{ success: true, data: { methods: [...] } }` with masked account numbers; create `backend/src/api/routes/withdrawalMethodRoutes.js`
- [x] T031 [US2] Implement POST /api/withdrawals route and controller: create `backend/src/api/controllers/withdrawalController.js` with `createWithdrawal` handler that validates request body (method_id required integer, amount required positive number), calls withdrawalService.processWithdrawal, returns 201 with `{ success: true, data: { withdrawal, new_balance }, message: "Withdrawal completed successfully" }`; create `backend/src/api/routes/withdrawalRoutes.js`; register both US2 routes in `backend/src/server.js`

#### Frontend

- [x] T032 [US2] Create WithdrawalMethodSelect component in `frontend/src/components/WithdrawalMethodSelect.jsx`: fetch withdrawal methods via api.getWithdrawalMethods(); display list of bank accounts with bank_name, masked account_number, and account_type; allow user to select one; call `onSelect(method)` callback with chosen method. Handle loading and empty states (show message if no methods available)
- [x] T033 [US2] Create WithdrawalConfirm component in `frontend/src/components/WithdrawalConfirm.jsx`: accept `method`, `amount`, `onConfirm`, `onCancel` props; display summary card showing withdrawal amount (formatted), bank name, masked account number; show "Confirm Withdrawal" and "Cancel" buttons; disable confirm button while processing (loading state)
- [x] T034 [US2] Create WithdrawalSuccess component in `frontend/src/components/WithdrawalSuccess.jsx`: accept `withdrawal` and `newBalance` props; display success message with checkmark icon, withdrawal amount, bank name, and new balance; include "Back to Dashboard" button
- [x] T035 [US2] Create WithdrawalFlow component in `frontend/src/components/WithdrawalFlow.jsx`: implement multi-step wizard with steps: (1) SelectMethod → (2) EnterAmount (input with validation: positive, max 2 decimals, <= balance) → (3) Confirm → (4) Success. Use local component state for current step, selected method, amount, loading, and error. Call api.createWithdrawal on confirm. Handle API errors (show insufficient balance message from error.details). On success, trigger context refetch
- [x] T036 [US2] Add withdrawal navigation and route: update `frontend/src/App.jsx` to add "/withdraw" route rendering WithdrawalFlow; add "Withdraw" button to Dashboard component that navigates to /withdraw; update `frontend/src/context/UserContext.jsx` to expose `refetch()` function and `withdrawalMethods` state

### Tests for User Story 2

- [x] T037 [P] [US2] Write backend tests for withdrawal service and endpoints: create `backend/tests/unit/services/withdrawalService.test.js` testing processWithdrawal with valid withdrawal, insufficient balance error (code INSUFFICIENT_BALANCE), invalid method error, amount validation; create `backend/tests/integration/withdrawals.test.js` testing POST /api/withdrawals returns 201 on success with new_balance, returns 422 on insufficient balance, returns 400 on invalid input, returns 404 on unknown method_id; test GET /api/withdrawal-methods returns masked account numbers
- [x] T038 [P] [US2] Write frontend component tests in `frontend/tests/components/WithdrawalFlow.test.jsx`: test full wizard flow (select method → enter amount → confirm → success), test insufficient balance error display, test cancel returns to amount entry, test loading states during API call. Use mocked api.js functions and React Testing Library

**Checkpoint**: Withdrawal flow is fully functional — user can select bank account, enter amount, confirm, and see success. Balance updates immediately. US1 + US2 work together seamlessly

---

## Phase 5: User Story 3 - Duplicate Withdrawal Prevention (Priority: P3)

**Goal**: Users receive a warning when attempting to withdraw the same amount within 5 minutes, with option to proceed or cancel

**Independent Test**: Make withdrawal of $50 → attempt $50 again within 5 minutes → verify warning appears → test both "proceed" (processes withdrawal) and "cancel" (returns to form) paths. Verify no warning for different amounts or after 5+ minutes

### Implementation for User Story 3

#### Backend

- [x] T039 [US3] Implement duplicate detection service in `backend/src/services/duplicateDetectionService.js`: export `checkDuplicateWithdrawal(userId, amount)` that queries transactions table for withdrawal with matching amount within last 5 minutes (`WHERE user_id = ? AND type = 'withdrawal' AND amount = ? AND timestamp > datetime('now', '-5 minutes')`). Returns `{ isDuplicate: boolean, lastWithdrawalAt: string|null }`
- [x] T040 [US3] Integrate duplicate check into withdrawal controller: update `backend/src/api/controllers/withdrawalController.js` to call duplicateDetectionService.checkDuplicateWithdrawal before processing. If duplicate detected AND `override_duplicate_check` is not true in request body, return 409 Conflict with `{ success: false, error: { code: "DUPLICATE_WITHDRAWAL", message: "You recently withdrew this amount. Are you sure you want to proceed?", details: { amount, last_withdrawal_at, allow_override: true } } }`. If `override_duplicate_check: true`, skip the check and proceed normally

#### Frontend

- [x] T041 [US3] Create DuplicateWarningModal component in `frontend/src/components/DuplicateWarningModal.jsx`: accept `amount`, `lastWithdrawalAt`, `onProceed`, `onCancel` props; display warning message "You recently withdrew this amount. Are you sure you want to proceed?" with formatted amount and time; show "Yes, proceed" button (calls onProceed) and "Cancel" button (calls onCancel); use modal/overlay styling with Tailwind
- [x] T042 [US3] Update WithdrawalFlow to handle duplicate responses: modify `frontend/src/components/WithdrawalFlow.jsx` to detect 409 status with DUPLICATE_WITHDRAWAL error code from api.createWithdrawal; show DuplicateWarningModal when detected; on "proceed" → retry createWithdrawal with `overrideDuplicateCheck: true`; on "cancel" → return to amount entry step. Update `frontend/src/services/api.js` createWithdrawal to pass `override_duplicate_check` parameter in request body

### Tests for User Story 3

- [x] T043 [P] [US3] Write backend tests for duplicate detection: create `backend/tests/unit/services/duplicateDetection.test.js` testing checkDuplicateWithdrawal returns true for same amount within 5 minutes, false for different amount, false for same amount after 5+ minutes; create `backend/tests/integration/duplicateWithdrawal.test.js` testing POST /api/withdrawals returns 409 on duplicate, 201 when override_duplicate_check is true, 201 for different amounts
- [x] T044 [P] [US3] Write frontend test in `frontend/tests/components/DuplicateWarning.test.jsx`: test DuplicateWarningModal renders warning message, test proceed button calls onProceed, test cancel button calls onCancel; test WithdrawalFlow shows modal on 409 response and retries with override on proceed

**Checkpoint**: Duplicate prevention is active — all three user stories work together. Full application functionality is complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality assurance

- [x] T045 [P] Add loading states and error handling UI across all components: add spinner/skeleton loading indicators to Dashboard (while fetching), WithdrawalMethodSelect (while fetching methods), WithdrawalFlow (while processing withdrawal); ensure all API errors display user-friendly messages in `frontend/src/components/`
- [x] T046 [P] Apply responsive Tailwind CSS styling to all components: style Dashboard balance card, TransactionList with month headers and transaction items, WithdrawalFlow steps, confirmation card, success screen, and DuplicateWarningModal per Figma design specifications. Ensure mobile-responsive layout in `frontend/src/components/`
- [x] T047 Run end-to-end validation per quickstart.md: start backend (`npm run dev`), start frontend (`npm run dev`), verify all flows (dashboard shows balance and grouped transactions, withdrawal flow completes successfully, duplicate warning appears for same amount within 5 minutes), run `npm test` in both backend and frontend directories and ensure all tests pass
- [x] T048 Final code cleanup: verify consistent error handling across all endpoints, ensure all environment variables are documented in `.env.example` files for both `backend/.env.example` and `frontend/.env.example`, verify CORS configuration works correctly between frontend and backend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on Foundational phase completion. Functionally independent from US1, but shares UserContext — recommend completing US1 first
- **User Story 3 (Phase 5)**: Depends on US2 (extends withdrawal endpoint and WithdrawalFlow component)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

```text
Phase 1: Setup
    │
    ▼
Phase 2: Foundational (BLOCKS ALL)
    │
    ├─────────────────┐
    ▼                 ▼
Phase 3: US1      Phase 4: US2 (can start after Phase 2, recommended after US1)
(Dashboard)       (Withdrawal Flow)
                      │
                      ▼
                  Phase 5: US3
                  (Duplicate Prevention)
                      │
                      ▼
                  Phase 6: Polish
```

### Within Each User Story

- Models before services (models are data layer, services use models)
- Services before controllers/routes (controllers call services)
- Backend endpoints before frontend components (frontend consumes API)
- Core implementation before integration (wiring up routes, context)
- Tests can run in parallel after implementation tasks within same story

### Parallel Opportunities

**Phase 1** (2 parallel groups):
- Sequential: T001 → T002
- Parallel after T001: T003 ∥ T004

**Phase 2** (parallel after T005):
- Sequential: T005 → T007 → T008
- Parallel after T005: T006 ∥ T009 ∥ T010 ∥ T011 ∥ T012

**Phase 3 - US1** (parallel within backend, then frontend):
- Backend parallel: T013 ∥ T014, then sequential T015 → T016 → T017
- Frontend parallel: T018 (context) ∥ T019 (groupByMonth), then T020 → T021 → T022
- Tests parallel: T023 ∥ T024 ∥ T025 ∥ T026

**Phase 4 - US2** (parallel within backend, then frontend):
- Backend parallel: T027 ∥ T028, then T029 → T030 → T031
- Frontend sequential: T032 → T033 → T034 → T035 → T036
- Tests parallel: T037 ∥ T038

**Phase 5 - US3** (mostly sequential):
- Backend: T039 → T040
- Frontend: T041 → T042
- Tests parallel: T043 ∥ T044

**Phase 6** (parallel):
- Parallel: T045 ∥ T046, then T047 → T048

---

## Parallel Example: User Story 1

```bash
# Launch backend models in parallel:
Task: "Implement User model in backend/src/models/user.js"
Task: "Implement Transaction model in backend/src/models/transaction.js"

# After models complete, launch endpoints in parallel:
Task: "Implement GET /api/user/profile endpoint"
Task: "Implement GET /api/transactions endpoint"

# Launch frontend context and utility in parallel:
Task: "Create UserContext provider in frontend/src/context/UserContext.jsx"
Task: "Implement groupByMonth utility in frontend/src/utils/groupByMonth.js"

# After all US1 implementation, launch all tests in parallel:
Task: "Write backend unit tests for models"
Task: "Write backend integration tests for endpoints"
Task: "Write frontend component tests for Dashboard"
Task: "Write frontend utility test for groupByMonth"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 — Dashboard with balance and transaction history
4. **STOP and VALIDATE**: Test US1 independently — dashboard shows correct balance, transactions grouped by month
5. Deploy/demo if ready — delivers core value

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → **MVP! Users can view rewards** 🎯
3. Add User Story 2 → Test independently → Users can withdraw funds
4. Add User Story 3 → Test independently → Duplicate withdrawal safety
5. Polish → Loading states, responsive design, final validation
6. Each story adds value without breaking previous stories

### Single Developer Strategy (Recommended)

Execute phases sequentially in priority order:

```text
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1/Dashboard) →
Phase 4 (US2/Withdrawal) → Phase 5 (US3/Duplicate) → Phase 6 (Polish)
```

Within each phase, maximize parallelism on tasks marked [P].

---

## Task Summary

| Phase | Description | Tasks | Parallel Tasks |
|-------|-------------|-------|----------------|
| Phase 1 | Setup | 4 | 2 |
| Phase 2 | Foundational | 8 | 5 |
| Phase 3 | US1 - Dashboard (P1) 🎯 | 14 | 8 |
| Phase 4 | US2 - Withdrawal Flow (P2) | 12 | 4 |
| Phase 5 | US3 - Duplicate Prevention (P3) | 6 | 2 |
| Phase 6 | Polish & Cross-Cutting | 4 | 2 |
| **Total** | | **48** | **23** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Test tasks follow implementation (pragmatic testing, not strict TDD)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths reference the project structure defined in plan.md
