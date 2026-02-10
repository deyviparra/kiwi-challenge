# Research & Technical Decisions

**Feature**: Rewards and Cashback Application
**Branch**: `001-rewards-cashback-app`
**Date**: 2026-02-08
**Status**: ✅ Complete

---

## Decision 1: Storage - SQLite vs JSON

### Context
The application needs persistent storage for user data, transactions, withdrawal methods, and withdrawal records. The constitution allows both relational databases (SQLite) and file-based storage (JSON).

### Decision: **SQLite**

### Rationale

**Chosen SQLite because**:
1. **Data Integrity**: Built-in support for ACID transactions, ensuring balance calculations remain consistent even with concurrent operations
2. **Query Capabilities**: Native support for date grouping (GROUP BY month), filtering, and aggregation which simplifies transaction history retrieval
3. **Concurrent Access**: Better handling of concurrent read/write operations compared to file locking with JSON
4. **Relationships**: Natural support for foreign keys and relationships between entities (User → Transactions, User → WithdrawalMethods)
5. **Performance**: Indexed queries for filtering transactions by date, type, and user will be significantly faster than parsing JSON
6. **Validation**: Schema enforcement at the database level prevents invalid data
7. **Testing**: Easier to create isolated test databases vs managing test JSON files

### Alternatives Considered

**JSON File Storage**:
- ✅ Pros: Simpler setup, no database driver needed, human-readable format, easy to inspect
- ❌ Cons:
  - No built-in transaction support (risk of data corruption on concurrent writes)
  - Manual implementation of relationships and referential integrity
  - Complex queries require loading entire file into memory
  - File locking challenges on Windows
  - Performance degrades with transaction history growth
  - Month grouping would require application-level logic

**Why JSON was rejected**: While simpler initially, the requirements for transaction history grouping, balance calculation integrity, and duplicate withdrawal detection require atomic operations and efficient querying that SQLite provides out of the box. The small overhead of SQLite (5MB library) is justified by the reliability gains.

### Implementation Notes
- Use `better-sqlite3` package (synchronous API, better performance than async wrappers)
- Database file location: `backend/data/rewards.db`
- Migrations managed via simple SQL scripts in `backend/src/db/migrations/`
- In-memory database for tests (`:memory:`)

---

## Decision 2: State Management - React Context vs Zustand

### Context
The frontend needs to manage user state (balance, transactions, withdrawal methods) and share it across components (Dashboard, TransactionList, WithdrawalFlow).

### Decision: **React Context API**

### Rationale

**Chosen React Context because**:
1. **Simplicity**: Built into React, no additional dependencies or bundle size increase
2. **Sufficient for Use Case**: Application has simple state requirements (user data, loading states, errors) without complex update patterns
3. **Component Hierarchy**: Natural fit for top-down data flow (UserProvider wraps App components)
4. **Learning Curve**: Standard React API, easier for maintenance and onboarding
5. **DevTools**: React DevTools already provides context inspection
6. **Server State**: State is primarily server-driven (API responses), not complex client-side state mutations

### Alternatives Considered

**Zustand**:
- ✅ Pros: Smaller boilerplate, middleware support, easier to test in isolation, better performance for frequent updates
- ❌ Cons:
  - Additional dependency (~1.5KB but still overhead)
  - Overkill for simple server state management
  - Team familiarity with Context API higher
  - Performance difference negligible for ~4-6 components

**Why Zustand was rejected**: While Zustand offers a cleaner API and better performance for complex client state, this application's state is primarily fetched from the server and displayed. The complexity of Zustand (actions, selectors, middleware) isn't needed for:
- Fetching user profile (infrequent)
- Loading transaction history (infrequent, read-only)
- Withdrawal flow state (local component state sufficient)

### Implementation Notes
- Create `UserContext` with provider that fetches user profile and transactions on mount
- Expose `useUser()` custom hook for components to consume context
- Local component state for form inputs and UI state (loading, errors)
- Context holds: `{ user, balance, transactions, withdrawalMethods, isLoading, error, refetch }`

---

## Decision 3: Duplicate Withdrawal Detection Pattern

### Context
Requirement FR-012/FR-013: Prevent consecutive withdrawals of the same amount within 5 minutes with a warning message.

### Decision: **Time-Window with Database Query**

### Rationale

**Chosen time-window database query because**:
1. **Server-Side Enforcement**: Check happens in the API, independent of user session or client state
2. **Simple Implementation**: Single SQL query to check recent transactions: `SELECT * FROM transactions WHERE type='withdrawal' AND amount=? AND timestamp > datetime('now', '-5 minutes')`
3. **No Additional Infrastructure**: Uses existing database, no caching layer needed
4. **Accurate Time Tracking**: Database timestamps are authoritative, not dependent on client clock
5. **Stateless**: Works across server restarts, session timeouts, multiple devices

### Pattern Details

**Request Flow**:
1. User submits withdrawal amount
2. Backend queries: "Does a withdrawal with this exact amount exist in the last 5 minutes?"
3. If YES → Return HTTP 409 Conflict with warning message and `allow_override: true` flag
4. If NO → Proceed with normal validation (balance check)
5. If user confirms override → Client sends `override_duplicate_check: true` in request body
6. Backend processes withdrawal if override flag is present

### Alternatives Considered

**Idempotency Keys**:
- ✅ Pros: Industry standard, prevents duplicate requests entirely
- ❌ Cons:
  - More complex (generate unique keys, store in database, handle expiry)
  - Requirement is to WARN, not PREVENT (user can proceed after warning)
  - Overkill for single-user or small user base

**In-Memory Cache (Redis/LRU)**:
- ✅ Pros: Faster than database query, less I/O
- ❌ Cons:
  - Additional infrastructure (Redis) or memory overhead
  - Lost on server restart unless persisted
  - Unnecessary complexity for ~10-20 req/min expected load

**Client-Side Check Only**:
- ✅ Pros: Instant feedback, no server round-trip
- ❌ Cons:
  - Easily bypassed (direct API calls)
  - Fails if user opens app on different device
  - Session storage cleared on logout

### Implementation Notes
- Middleware function: `checkDuplicateWithdrawal(amount, userId)`
- SQL query with 5-minute window: `WHERE timestamp > datetime('now', '-5 minutes')`
- Return format: `{ status: 409, message: "You recently withdrew this amount. Are you sure?", allow_override: true }`
- Override parameter: `POST /api/withdrawals { amount, methodId, override_duplicate_check: true }`

---

## Decision 4: API Error Handling Pattern

### Context
Requirement II (Constitution): API must return consistent error responses with appropriate HTTP status codes.

### Decision: **Standard JSON Error Format with Express Middleware**

### Rationale

**Chosen standardized error middleware because**:
1. **Consistency**: All endpoints return errors in the same format
2. **Client-Friendly**: Frontend can reliably parse error messages
3. **HTTP Standards**: Uses appropriate status codes (400, 404, 409, 422, 500)
4. **Validation Integration**: Works with express-validator for request validation
5. **Debugging Support**: Includes request ID and timestamp for tracing

### Error Response Schema

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance for withdrawal",
    "details": {
      "requested": 100.00,
      "available": 75.50
    },
    "timestamp": "2026-02-08T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### HTTP Status Code Mapping

| Status | Use Case | Example |
|--------|----------|---------|
| 400 Bad Request | Invalid request format | Missing required field |
| 404 Not Found | Resource doesn't exist | User or withdrawal method not found |
| 409 Conflict | Business logic violation | Duplicate withdrawal warning |
| 422 Unprocessable Entity | Validation failure | Withdrawal amount exceeds balance |
| 500 Internal Server Error | Unexpected error | Database connection failure |

### Implementation Notes
- Central error handler: `backend/src/api/middleware/errorHandler.js`
- Custom error classes: `ValidationError`, `NotFoundError`, `ConflictError`, `BusinessLogicError`
- Request ID generation: `req.id = uuidv4()` in middleware
- Express-validator integration for input validation
- Development mode includes stack traces, production mode hides internals

---

## Decision 5: Transaction Grouping by Month

### Context
Requirement FR-002: Display transaction history grouped by month, most recent month first.

### Decision: **Client-Side Grouping with Server-Side Sorting**

### Rationale

**Chosen hybrid approach because**:
1. **Flexibility**: Allows UI to control grouping format (e.g., "January 2026" vs "Jan '26")
2. **Server Simplicity**: API returns flat list sorted by date descending
3. **Pagination-Friendly**: Easy to add pagination later (return transactions with cursor/offset)
4. **Client Performance**: Grouping 10k transactions in-browser takes <50ms (negligible)
5. **Reusability**: Same API endpoint serves different UI needs (grouped, ungrouped, filtered)

### Server Response Format

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_001",
        "type": "cashback",
        "amount": 25.50,
        "description": "Purchase reward",
        "timestamp": "2026-02-08T14:30:00Z"
      },
      {
        "id": "txn_002",
        "type": "withdrawal",
        "amount": -50.00,
        "description": "Withdrawal to Bank ****1234",
        "timestamp": "2026-02-07T10:15:00Z"
      }
    ],
    "total": 128,
    "balance": 150.50
  }
}
```

### Client Grouping Logic

```javascript
// Group transactions by month
const grouped = transactions.reduce((acc, txn) => {
  const monthKey = new Date(txn.timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  }); // "February 2026"

  if (!acc[monthKey]) acc[monthKey] = [];
  acc[monthKey].push(txn);
  return acc;
}, {});
```

### Alternatives Considered

**Server-Side SQL GROUP BY**:
- ✅ Pros: Reduces data transfer, offloads processing
- ❌ Cons:
  - Complex SQL (nested JSON or multiple queries)
  - Less flexible (UI locked into server's grouping format)
  - Pagination becomes harder (cursor within groups)
  - Date formatting must match client timezone

**Why SQL GROUP BY was rejected**: While database grouping is more efficient for large datasets, the expected transaction volume (<10k per user) doesn't justify the added complexity. Client-side grouping allows:
- Easy internationalization (different date formats per locale)
- Flexible UI changes without backend updates
- Simpler API contract (just a sorted list)

### Implementation Notes
- API endpoint: `GET /api/transactions?limit=100&offset=0`
- SQL query: `SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?`
- Client utility: `utils/groupByMonth.js`
- Consider adding filter parameters later: `?type=cashback&startDate=2026-01-01`

---

## Summary of Decisions

| Decision | Choice | Primary Reason |
|----------|--------|----------------|
| **Storage** | SQLite | Data integrity and query capabilities |
| **State Management** | React Context | Simplicity and sufficient for use case |
| **Duplicate Detection** | Time-window DB query | Server-side, stateless, simple |
| **Error Handling** | Standard JSON + middleware | Consistency and HTTP standards |
| **Transaction Grouping** | Client-side | Flexibility and simplicity |

**All research tasks complete. Ready for Phase 1 (Design Artifacts).**
