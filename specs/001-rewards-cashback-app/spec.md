# Feature Specification: Rewards and Cashback Application

**Feature Branch**: `001-rewards-cashback-app`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "Build a Rewards and Cashback application based on the Figma design with these key features:

1. Dashboard: Show balance and transaction history (cashback, referral_bonus, withdrawal) grouped by month.
2. Withdrawal Flow: Allow selecting a bank account (WithdrawalMethod), confirming the amount, and showing success.
3. Business Logic: Prevent consecutive withdrawals of the same amount within minutes (warning message).
4. Architecture: Implement a React frontend and a simple Node.js backend with JSON or SQLite persistence as allowed by the constitution."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Dashboard with Balance and Transaction History (Priority: P1)

A user opens the rewards application to check their current balance and review their transaction history. They want to see all transactions (cashback earned, referral bonuses received, and withdrawals made) organized by month for easy tracking.

**Why this priority**: This is the core value proposition of the application - users need to see their rewards and understand where their balance comes from. Without this, users cannot make informed decisions about withdrawals.

**Independent Test**: Can be fully tested by loading the dashboard with sample transaction data and verifying that the balance is calculated correctly and transactions are grouped by month. Delivers immediate value by showing users their rewards status.

**Acceptance Scenarios**:

1. **Given** a user has a rewards balance of $150.50, **When** they open the dashboard, **Then** they see their balance displayed prominently as "$150.50"
2. **Given** a user has transactions from January, February, and March, **When** they view the dashboard, **Then** they see transactions grouped by month with month headers
3. **Given** a user has cashback transactions of +$25, referral bonuses of +$50, and withdrawals of -$30, **When** they view their transaction history, **Then** they see each transaction with its type (cashback/referral_bonus/withdrawal), amount, and timestamp
4. **Given** a user has no transactions, **When** they open the dashboard, **Then** they see a balance of $0.00 and a message indicating no transaction history
5. **Given** a user has transactions in the current month, **When** they view the dashboard, **Then** the most recent month appears first, followed by older months in descending order

---

### User Story 2 - Complete Withdrawal Flow (Priority: P2)

A user wants to withdraw their entire rewards balance to their bank account. They see their withdrawal amount (full balance), select one of their linked bank accounts, confirm the withdrawal, and receive confirmation that their withdrawal request was successful.

**Why this priority**: This is the primary action users take to convert their rewards into real money. Without withdrawals, rewards have no tangible value. This is essential but depends on having a balance to withdraw (P1).

**Independent Test**: Can be tested by viewing the pre-filled amount, selecting a withdrawal method from a predefined list, confirming the withdrawal, and verifying that a success message is displayed and the balance is updated accordingly.

**Acceptance Scenarios**:

1. **Given** a user has a balance of $100 and two linked bank accounts, **When** they initiate a withdrawal, **Then** they see their full balance as the withdrawal amount and a prompt to select a bank account
2. **Given** a user is on the amount screen, **When** they select a bank account, **Then** they are shown a confirmation screen displaying the amount, bank account details (masked), and a confirm button
3. **Given** a user is on the confirmation screen for a withdrawal, **When** they confirm the withdrawal, **Then** they see a success message and their balance is reduced accordingly
4. **Given** a user has a balance of $30, **When** they attempt to withdraw $50 (manually edited), **Then** they see an error message stating "Saldo insuficiente" (Insufficient balance)
5. **Given** a user completes a withdrawal, **When** they return to the dashboard, **Then** they see a new withdrawal transaction in their history with a negative amount

---

### User Story 3 - Handle Duplicate Withdrawal Prevention (Priority: P3)

To prevent accidental duplicate withdrawals, when a user attempts to withdraw the same amount they just withdrew within a short time period, the system shows a warning message asking them to confirm this is intentional.

**Why this priority**: This is a safety feature that prevents costly mistakes but doesn't block core functionality. It enhances the user experience but the application is functional without it.

**Independent Test**: Can be tested by completing a withdrawal of $50, then immediately attempting another withdrawal of $50 within 5 minutes, and verifying that a warning message appears.

**Acceptance Scenarios**:

1. **Given** a user just withdrew $50 at 2:00 PM, **When** they attempt to withdraw $50 again at 2:03 PM, **Then** they see a warning message stating "You recently withdrew this amount. Are you sure you want to proceed?"
2. **Given** a user sees the duplicate withdrawal warning, **When** they click "Yes, proceed", **Then** the withdrawal is processed normally
3. **Given** a user sees the duplicate withdrawal warning, **When** they click "Cancel", **Then** they are returned to the withdrawal amount entry screen
4. **Given** a user withdrew $50 at 2:00 PM, **When** they attempt to withdraw $75 at 2:02 PM, **Then** no warning is shown (different amount)
5. **Given** a user withdrew $50 at 2:00 PM, **When** they attempt to withdraw $50 again at 2:06 PM, **Then** no warning is shown (more than 5 minutes elapsed)

---

### Edge Cases

- What happens when a user has multiple transactions in a single day within the same month?
  - All transactions should appear under the same month grouping, ordered by timestamp (most recent first)
- How does the system handle concurrent withdrawal requests?
  - Only one withdrawal can be processed at a time per user to prevent balance inconsistencies
- What happens when a withdrawal amount has more than 2 decimal places?
  - System rejects the input with a validation error (amounts must have at most 2 decimal places)
- How does the system behave if a user has no linked bank accounts?
  - Withdrawal button is disabled with a "Sin cuentas" label indicating no accounts are available
- What happens to the duplicate withdrawal check if the user's session expires?
  - The check should be server-side based on transaction timestamps, not session state
- How are negative balances prevented?
  - System must validate withdrawal amount against current balance before processing

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the user's current rewards balance prominently on the dashboard
- **FR-002**: System MUST display transaction history grouped by month, with the most recent month first
- **FR-003**: System MUST support three transaction types: cashback (credit), referral_bonus (credit), and withdrawal (debit)
- **FR-004**: System MUST calculate the balance as the sum of all credits minus all debits (implementation detail for FR-001)
- **FR-005**: System MUST display each transaction with its type, amount, and timestamp
- **FR-006**: System MUST allow users to initiate a withdrawal by selecting a linked bank account (WithdrawalMethod)
- **FR-007**: System MUST display a confirmation screen before processing a withdrawal, showing the amount and selected bank account
- **FR-008**: System MUST validate that the withdrawal amount does not exceed the current balance
- **FR-009**: System MUST process confirmed withdrawals by creating a withdrawal transaction with a negative amount
- **FR-010**: System MUST update the balance immediately after a withdrawal is confirmed
- **FR-011**: System MUST display a success message after a withdrawal is completed
- **FR-012**: System MUST check if a withdrawal of the same amount was made within the last 5 minutes
- **FR-013**: System MUST display a warning message when a duplicate withdrawal attempt is detected
- **FR-014**: System MUST allow users to proceed with or cancel a duplicate withdrawal after seeing the warning
- **FR-015**: System MUST persist all transactions and maintain data integrity across sessions
- **FR-016**: System MUST validate withdrawal amounts to ensure they are positive numbers with at most 2 decimal places
- **FR-017**: System MUST mask bank account numbers in the UI for security (e.g., show only last 4 digits)
- **FR-018**: System MUST handle cases where a user has no linked bank accounts by disabling the withdrawal button with a "Sin cuentas" label, and showing "Sin saldo" when balance is zero

### Key Entities

- **User**: Represents a rewards account holder with an accumulated balance, associated withdrawal methods, and transaction history
- **Transaction**: Represents a record of balance changes with type (cashback, referral_bonus, withdrawal), amount (positive for credits, negative for debits), timestamp, and description
- **WithdrawalMethod**: Represents a linked bank account for withdrawals, associated with a user, containing account number (masked for display) and account type identifier
- **Withdrawal**: Represents a request to transfer funds, referencing a withdrawal method, with amount, status (pending, processing, completed, failed), and timestamps for creation and completion

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view their complete transaction history and current balance within 2 seconds of loading the dashboard
- **SC-002**: Users can complete the entire withdrawal flow (select bank, confirm amount, see success) in under 60 seconds
- **SC-003**: 100% of withdrawal amounts are validated against current balance before processing to prevent negative balances
- **SC-004**: Duplicate withdrawal warnings appear within 1 second when the same amount is withdrawn within 5 minutes
- **SC-005**: Transaction history grouping by month is accurate for all date ranges, including edge cases (year boundaries, leap years)
- **SC-006**: The application displays appropriate loading states and error messages for all user actions, maintaining user confidence
- **SC-007**: All monetary values are displayed with exactly 2 decimal places for consistency
- **SC-008**: The dashboard reflects balance changes immediately after withdrawal completion without requiring a page refresh

## Assumptions *(optional)*

- Users are already authenticated and have an active session (authentication/authorization is out of scope for this feature)
- The API uses a hardcoded `user_id = 1` since authentication is out of scope
- At least one withdrawal method (bank account) is already linked to the user's account
- **Full balance withdrawal**: Users always withdraw the entire balance; there is no step to enter a custom withdrawal amount (amount is pre-filled with the full balance but can be manually edited)
- Currency is displayed in a standard format (e.g., USD with $ symbol and 2 decimal places)
- The "minutes" threshold for duplicate withdrawal detection is set to 5 minutes (a common pattern for duplicate action prevention)
- Transaction timestamps are stored in UTC and converted to user's local time for display
- The Figma design provides the visual layout and styling specifications for all screens mentioned
- **UI language is Spanish** as specified by the Figma design ("Retirar", "Monto acumulado", "Elige tu método de retiro", etc.)
- Network connectivity is available for API calls (offline functionality is out of scope)
- The application supports modern browsers (Chrome, Firefox, Safari, Edge - last 2 versions)
- **Withdrawal amounts with more than 2 decimal places** are rejected with a validation error (not rounded)

## Dependencies *(optional)*

- Access to the Figma design file for UI implementation
- Existing backend API structure or ability to create new API endpoints
- Data persistence layer (JSON file storage or SQLite database)
- React development environment and build tooling
