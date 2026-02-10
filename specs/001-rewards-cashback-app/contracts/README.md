# API Contracts Documentation

**Feature**: Rewards and Cashback Application
**Branch**: `001-rewards-cashback-app`
**Base URL**: `http://localhost:3000/api`
**OpenAPI Spec**: [api-spec.yaml](./api-spec.yaml)

---

## Overview

The Rewards and Cashback API is a RESTful API that allows users to:
- View their rewards balance and profile
- Retrieve transaction history with pagination
- List linked bank accounts (withdrawal methods)
- Create withdrawal requests to transfer rewards to bank accounts

All API responses follow a consistent format with `success` boolean and either `data` (success) or `error` (failure) objects.

---

## Authentication

**Current Implementation**: Not implemented (assumes authenticated user session)

**Future Consideration**: For production, implement one of:
- Session-based authentication with cookies
- JWT tokens in `Authorization: Bearer <token>` header
- OAuth2 for third-party integrations

For now, endpoints assume a single user (user ID hardcoded or from session).

---

## API Endpoints

### 1. Get User Profile

**Endpoint**: `GET /api/user/profile`

**Description**: Returns the authenticated user's profile information and current rewards balance.

**Request**:
```bash
curl -X GET http://localhost:3000/api/user/profile
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "balance": 150.50,
      "created_at": "2026-01-10T10:00:00Z"
    }
  }
}
```

**Use Cases**:
- Display user info in dashboard header
- Show current balance before withdrawal
- Verify user identity

---

### 2. Get Transaction History

**Endpoint**: `GET /api/transactions`

**Description**: Returns paginated list of user's transactions, sorted by timestamp (most recent first).

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 100 | Maximum transactions to return (1-500) |
| `offset` | integer | 0 | Number of transactions to skip (pagination) |
| `type` | string | (all) | Filter by type: `cashback`, `referral_bonus`, `withdrawal` |

**Request Examples**:
```bash
# Get first 100 transactions
curl -X GET http://localhost:3000/api/transactions

# Get next 100 transactions (pagination)
curl -X GET http://localhost:3000/api/transactions?offset=100&limit=100

# Get only cashback transactions
curl -X GET "http://localhost:3000/api/transactions?type=cashback"
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_001",
        "type": "cashback",
        "amount": 25.50,
        "description": "Purchase reward from Amazon",
        "timestamp": "2026-02-08T14:30:00Z"
      },
      {
        "id": "txn_002",
        "type": "withdrawal",
        "amount": -50.00,
        "description": "Withdrawal to Chase Bank ****1234",
        "timestamp": "2026-02-07T10:15:00Z"
      }
    ],
    "total": 128,
    "balance": 150.50
  }
}
```

**Use Cases**:
- Display transaction history in dashboard
- Group transactions by month (client-side)
- Implement infinite scroll or pagination

---

### 3. Get Withdrawal Methods

**Endpoint**: `GET /api/withdrawal-methods`

**Description**: Returns list of user's linked bank accounts available for withdrawals.

**Request**:
```bash
curl -X GET http://localhost:3000/api/withdrawal-methods
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "methods": [
      {
        "id": 1,
        "bank_name": "Chase Bank",
        "account_number": "****7890",
        "account_type": "checking",
        "is_active": true
      },
      {
        "id": 2,
        "bank_name": "Bank of America",
        "account_number": "****3210",
        "account_type": "savings",
        "is_active": true
      }
    ]
  }
}
```

**Notes**:
- `account_number` is masked (only last 4 digits visible)
- Only active methods (`is_active: true`) are returned
- If empty array, user has no linked accounts (disable withdrawal button)

**Use Cases**:
- Display bank account selection during withdrawal flow
- Show masked account numbers for security
- Validate withdrawal method exists before confirming

---

### 4. Create Withdrawal

**Endpoint**: `POST /api/withdrawals`

**Description**: Initiates a withdrawal request to transfer funds from rewards balance to a linked bank account.

**Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `method_id` | integer | Yes | ID of withdrawal method (bank account) |
| `amount` | number | Yes | Withdrawal amount (positive, max 2 decimals) |
| `override_duplicate_check` | boolean | No | Set to `true` to bypass duplicate warning (default: `false`) |

**Request Examples**:

```bash
# Normal withdrawal
curl -X POST http://localhost:3000/api/withdrawals \
  -H "Content-Type: application/json" \
  -d '{
    "method_id": 1,
    "amount": 50.00
  }'

# Withdrawal with duplicate override
curl -X POST http://localhost:3000/api/withdrawals \
  -H "Content-Type: application/json" \
  -d '{
    "method_id": 1,
    "amount": 50.00,
    "override_duplicate_check": true
  }'
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "withdrawal": {
      "id": 5,
      "amount": 50.00,
      "status": "completed",
      "method": {
        "bank_name": "Chase Bank",
        "account_number": "****7890"
      },
      "requested_at": "2026-02-08T15:30:00Z",
      "completed_at": "2026-02-08T15:30:01Z"
    },
    "new_balance": 100.50
  },
  "message": "Withdrawal completed successfully"
}
```

**Error Responses**:

#### 400 Bad Request (Invalid Input)
```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Missing required field: method_id",
    "details": {
      "field": "method_id"
    },
    "timestamp": "2026-02-08T15:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Validation Rules**:
- `method_id` must be a valid integer
- `amount` must be positive number with max 2 decimal places
- `amount` must be >= 0.01

---

#### 404 Not Found (Method Not Found)
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Withdrawal method not found",
    "details": {
      "method_id": 999
    },
    "timestamp": "2026-02-08T15:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Cause**: The specified `method_id` does not exist or is not active.

---

#### 409 Conflict (Duplicate Withdrawal Detected)
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_WITHDRAWAL",
    "message": "You recently withdrew this amount. Are you sure you want to proceed?",
    "details": {
      "amount": 50.00,
      "last_withdrawal_at": "2026-02-08T15:27:00Z",
      "allow_override": true
    },
    "timestamp": "2026-02-08T15:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Cause**: A withdrawal of the same amount was made within the last 5 minutes.

**Client Action**: Show warning modal to user with options:
- "Cancel" → Abort withdrawal
- "Yes, proceed" → Retry request with `override_duplicate_check: true`

---

#### 422 Unprocessable Entity (Insufficient Balance)
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
    "timestamp": "2026-02-08T15:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Cause**: User's current balance is less than the requested withdrawal amount.

**Client Action**: Display error message and show current balance.

---

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred",
    "timestamp": "2026-02-08T15:30:00Z",
    "requestId": "req_abc123"
  }
}
```

**Cause**: Unexpected server error (database connection, unhandled exception).

**Client Action**: Show generic error message and suggest retrying later.

---

## Error Handling

### Standard Error Format

All error responses follow this structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... },
    "timestamp": "ISO 8601 timestamp",
    "requestId": "Unique request ID"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Missing or malformed request parameters |
| `NOT_FOUND` | 404 | Requested resource doesn't exist |
| `DUPLICATE_WITHDRAWAL` | 409 | Same amount withdrawn within 5 minutes |
| `INSUFFICIENT_BALANCE` | 422 | Withdrawal exceeds current balance |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Client Error Handling Best Practices

1. **Always check `success` field** before accessing `data` or `error`
2. **Display `error.message`** to users (human-readable)
3. **Use `error.code`** for programmatic error handling (conditionals)
4. **Show `error.details`** when available (e.g., available balance)
5. **Log `error.requestId`** for support debugging

**Example Client Code**:

```javascript
async function handleWithdrawal(methodId, amount) {
  try {
    const response = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method_id: methodId, amount })
    });

    const result = await response.json();

    if (!result.success) {
      // Handle specific error codes
      switch (result.error.code) {
        case 'DUPLICATE_WITHDRAWAL':
          return showDuplicateWarning(result.error, methodId, amount);
        case 'INSUFFICIENT_BALANCE':
          return showError(`Insufficient balance. Available: $${result.error.details.available}`);
        default:
          return showError(result.error.message);
      }
    }

    // Success
    showSuccess(result.message);
    updateBalance(result.data.new_balance);
  } catch (error) {
    showError('Network error. Please try again.');
  }
}
```

---

## Testing the API

### Using cURL

See example cURL commands above for each endpoint.

### Using Postman

1. Import OpenAPI spec: Import `api-spec.yaml` into Postman
2. Environment variables:
   - `base_url`: `http://localhost:3000/api`
3. Collection will be auto-generated with all endpoints

### Sample Test Scenarios

**Scenario 1: View Dashboard**
1. `GET /api/user/profile` → Get balance
2. `GET /api/transactions?limit=50` → Get recent transactions

**Scenario 2: Complete Withdrawal**
1. `GET /api/withdrawal-methods` → Get bank accounts
2. `POST /api/withdrawals` with `method_id=1, amount=50`
3. Handle response (success or error)
4. `GET /api/user/profile` → Verify new balance

**Scenario 3: Duplicate Withdrawal Warning**
1. `POST /api/withdrawals` with `amount=50` → Success
2. `POST /api/withdrawals` with `amount=50` again → 409 Conflict
3. `POST /api/withdrawals` with `amount=50, override_duplicate_check=true` → Success

---

## Response Time Expectations

| Endpoint | Expected Response Time | Notes |
|----------|------------------------|-------|
| `GET /api/user/profile` | < 100ms | Simple query with balance calculation |
| `GET /api/transactions` | < 200ms | Indexed query, depends on limit |
| `GET /api/withdrawal-methods` | < 50ms | Small dataset (2-5 records) |
| `POST /api/withdrawals` | < 300ms | Multiple DB operations (validate, insert, update) |

**Performance Tips**:
- Use pagination for transactions (don't fetch all at once)
- Cache withdrawal methods on client (rarely changes)
- Debounce withdrawal button to prevent double-clicks

---

## Changelog

### v1.0.0 (2026-02-08)
- Initial API design
- 4 endpoints: user profile, transactions, withdrawal methods, withdrawals
- Standard error format with codes
- Duplicate withdrawal detection with override
- OpenAPI 3.0 specification

---

## Support

For API questions or issues:
- Check OpenAPI spec: `api-spec.yaml`
- Review data model: `../data-model.md`
- See quickstart guide: `../quickstart.md`
