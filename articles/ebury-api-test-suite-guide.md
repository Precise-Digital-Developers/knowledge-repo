# Ebury API Test Suite - Usage Guide

## Table of Contents

1. [Overview](#overview)
2. [Initial Setup](#initial-setup)
3. [Authentication](#authentication)
4. [Using the Web Dashboard](#using-the-web-dashboard)
5. [Using the CLI Test Suites](#using-the-cli-test-suites)
6. [API Endpoints](#api-endpoints)
7. [Common Workflows](#common-workflows)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

---

## Overview

The Ebury API Test Suite is a comprehensive, production-ready testing framework for the Ebury payment platform API. Ebury is a licensed payment service provider offering international payments, foreign exchange (FX), and multi-currency account management.

### Key Capabilities

- **Dual Environment Support**: Test against sandbox (full CRUD) or production (read-only)
- **Interactive Dashboard**: Web-based interface for visual API testing
- **CLI Test Suites**: Automated testing with comprehensive endpoint coverage
- **OAuth2 Authentication**: Browser-based OAuth2 Authorization Code Flow with automatic token refresh
- **Automated Report Generation**: HTML, Markdown, and JSON reports generated after each test run
- **Royalty Payment Testing**: Specialized test suite for mass payment workflows (1200+ payees)
- **Safety Controls**: Production write-operation blocking prevents accidental modifications
- **Always-Current Summaries**: Auto-updating test result files for quick status checks

### Architecture

The project uses a modular architecture with environment-specific test classes:

```
BaseAPITester (base_test.py)
├── SandboxAPITester (test_sandbox.py)  - Full CRUD operations
└── ProductionAPITester (test_production.py)  - Read-only operations
```

### Environment Details

| Environment | API Base URL               | Auth URL                        | Operations Allowed |
| ----------- | -------------------------- | ------------------------------- | ------------------ |
| Sandbox     | `https://sandbox.ebury.io` | `https://auth-sandbox.ebury.io` | Full CRUD          |
| Production  | `https://api.ebury.io`     | `https://auth.ebury.io`         | Read-only          |

### Rate Limiting

- Dashboard: 100 requests/hour, 20 requests/minute
- API: Exponential backoff with retry logic built-in
- Token lifetime: 3600 seconds (1 hour)

---

## Initial Setup

### 1. Prerequisites

Before using the test suite, you need:

- Python 3.9 or higher
- Ebury API credentials for sandbox and/or production
- Access to Ebury Partner Portal for credential management

### 2. Project Structure

```
Ebury_API_Tests/
├── 📄 Core Application Files
│   ├── config.py                      # Configuration management
│   ├── base_test.py                   # Base test class with auth & reporting
│   ├── oauth_flow.py                  # OAuth2 browser authentication
│   ├── report_generator.py            # Automated report generation
│   ├── app.py                         # Flask web dashboard
│   └── verify_setup.py                # Setup verification tool
│
├── 🧪 Test Suites
│   ├── test_sandbox.py                # Standard API endpoint tests (16 tests)
│   ├── test_royalty_payments.py       # Royalty payment workflow tests (16 tests)
│   ├── test_production.py             # Production environment tests
│   └── test_api_with_tokens.py        # Quick token-based tests
│
├── 📚 Documentation
│   ├── README.md                      # Main project README
│   ├── QUICK_START.md                 # Quick start guide
│   ├── PROJECT_STRUCTURE.md           # Project organization guide
│   ├── CLEANUP_SUMMARY.md             # Codebase cleanup details
│   ├── LATEST_TEST_SUMMARY_SANDBOX.md # Latest test results (auto-updated)
│   ├── DOCUMENTATION_INDEX.md         # Documentation catalog
│   └── docs/
│       ├── AUTOMATED_REPORTS_SUMMARY.md
│       ├── REPORT_GENERATION.md
│       └── Ebury_API_Documentation.md
│
├── 🗃️ Archives
│   ├── archives/old_tests/            # Deprecated test files
│   └── archives/test_results/         # Old test result files
│
├── 🔐 Configuration (Not in version control)
│   ├── .env                           # Environment variables & credentials
│   └── .ebury_tokens.json             # OAuth2 access/refresh tokens
│
└── 🔧 Meta Files
    ├── .gitignore                     # Git ignore rules
    ├── requirements.txt               # Python dependencies
    └── CODEBASE_CLEANUP_COMPLETE.txt  # Cleanup record
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

Dependencies installed:

- `requests>=2.31.0` - HTTP client for API calls
- `PyJWT>=2.8.0` - JWT token handling
- `colorama>=0.4.6` - Colored console output
- `python-dotenv>=1.0.0` - Environment variable management
- `Flask==2.3.2` - Web dashboard framework
- `Flask-CORS==4.0.0` - CORS support
- `Flask-Limiter==3.5.0` - Rate limiting
- `cryptography>=41.0.0` - Cryptographic operations

### 4. Configure Environment Variables

Copy the example configuration:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Sandbox credentials
EBURY_SANDBOX_CLIENT_ID=your_sandbox_client_id
EBURY_SANDBOX_CLIENT_SECRET=your_sandbox_client_secret
EBURY_SANDBOX_USERNAME=your_sandbox_username
EBURY_SANDBOX_PASSWORD=your_sandbox_password

# Production credentials
EBURY_PROD_CLIENT_ID=your_production_client_id
EBURY_PROD_CLIENT_SECRET=your_production_client_secret
EBURY_PROD_USERNAME=your_production_username
EBURY_PROD_PASSWORD=your_production_password

# Optional
EBURY_DEFAULT_CLIENT_ID=your_ebury_client_id
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000
```

| Variable                      | Description                    | Required |
| ----------------------------- | ------------------------------ | -------- |
| `EBURY_SANDBOX_CLIENT_ID`     | Sandbox OAuth client ID        | Yes      |
| `EBURY_SANDBOX_CLIENT_SECRET` | Sandbox OAuth client secret    | Yes      |
| `EBURY_SANDBOX_USERNAME`      | Sandbox user for auth flow     | Optional |
| `EBURY_SANDBOX_PASSWORD`      | Sandbox user password          | Optional |
| `EBURY_PROD_CLIENT_ID`        | Production OAuth client ID     | Optional |
| `EBURY_PROD_CLIENT_SECRET`    | Production OAuth client secret | Optional |
| `EBURY_PROD_USERNAME`         | Production user for auth flow  | Optional |
| `EBURY_PROD_PASSWORD`         | Production user password       | Optional |
| `EBURY_DEFAULT_CLIENT_ID`     | Default Ebury client ID        | Optional |
| `FLASK_PORT`                  | Dashboard port                 | Optional |

### 5. Verify Setup

Run the verification utility:

```bash
python verify_setup.py
```

This checks:

- Python version (requires 3.9+)
- Dependency installation
- Environment file existence
- Credential configuration

---

## Authentication

### OAuth2 Authorization Code Flow (Browser-Based)

The Ebury API Test Suite uses **OAuth2 Authorization Code Flow** for authentication. This is the primary authentication method implemented in the project.

### How It Works

1. **Browser Authentication**: Opens your default browser automatically
2. **User Login**: You log in to Ebury with your credentials (including 2FA if enabled)
3. **Token Storage**: Access and refresh tokens are saved to `.ebury_tokens.json`
4. **Automatic Refresh**: Tokens are refreshed automatically when expired

### Quick Start: Get Your First Token

Run the OAuth flow script to authenticate via browser:

```bash
python oauth_flow.py
```

**What happens:**
1. Opens browser to Ebury login page
2. You log in with your Ebury credentials
3. Browser redirects back with authorization code
4. Script exchanges code for access token
5. Tokens saved to `.ebury_tokens.json`

**Example output:**
```
Opening browser for Ebury authentication...
Waiting for callback...
✓ Authentication successful!
✓ Tokens saved to .ebury_tokens.json
Access token expires in: 3600 seconds (1 hour)
```

### Token Storage: `.ebury_tokens.json`

After successful authentication, your tokens are stored in `.ebury_tokens.json`:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "refresh_token_value",
  "token_type": "Bearer",
  "expires_in": 3600,
  "expires_at": 1704815999,
  "scope": "read write"
}
```

**Important:** This file contains sensitive credentials and is automatically excluded from git via `.gitignore`.

### When to Re-authenticate

You need to run `python oauth_flow.py` when:

- Starting fresh (no `.ebury_tokens.json` file)
- Access token expired (every hour)
- You see "401 Unauthorized" errors
- Refresh token expired (up to 28 days)

### Automatic Token Refresh

The test suite automatically handles token refresh:

1. Checks if access token is expired
2. Uses refresh token to get new access token
3. Updates `.ebury_tokens.json` automatically
4. Retries failed requests with new token

### Token Details

| Token Type    | Validity      | Usage                            |
| ------------- | ------------- | -------------------------------- |
| Access Token  | 3600 sec      | API request authorization        |
| Refresh Token | Up to 28 days | Obtain new access tokens         |
| Authorization | One-time use  | Exchange for access/refresh pair |

### Using Tokens in API Requests

All API requests require the access token in the Authorization header:

```http
Authorization: Bearer {access_token}
```

The test suite handles this automatically by loading tokens from `.ebury_tokens.json`.

### Environment Variables Required

Your `.env` file needs these values:

```env
# OAuth2 Application Credentials
EBURY_SANDBOX_CLIENT_ID=P8Qf79gsNbl5tQp4kjb6Dhkg6EEUQpOg
EBURY_SANDBOX_CLIENT_SECRET=your_client_secret

# Ebury Client ID (for API calls)
EBURY_DEFAULT_CLIENT_ID=EBPCLI285961

# Production (optional)
EBURY_PROD_CLIENT_ID=your_production_client_id
EBURY_PROD_CLIENT_SECRET=your_production_client_secret
```

**Note:** Username and password are NOT stored in `.env` - you enter them in the browser during OAuth flow.

### Authentication Architecture

```
┌─────────────────┐
│  oauth_flow.py  │ ← Run this to authenticate
└────────┬────────┘
         │
         v
┌─────────────────────┐
│  Opens Browser      │
│  User logs in       │
│  Gets auth code     │
└────────┬────────────┘
         │
         v
┌──────────────────────┐
│ .ebury_tokens.json   │ ← Tokens stored here
└────────┬─────────────┘
         │
         v
┌──────────────────────┐
│  Test Suites         │ ← Auto-load tokens
│  - test_sandbox.py   │
│  - test_royalty_*    │
└──────────────────────┘
```

---

## Using the Web Dashboard

### 1. Start the Flask Server

```bash
python app.py
```

The server starts at `http://localhost:5000` by default.

### 2. Access the Dashboard

Open your browser and navigate to `http://localhost:5000`

### 3. Dashboard Features

#### Environment Selection

Select between Sandbox and Production environments. The dashboard automatically:

- Updates API endpoints for the selected environment
- Disables write operation buttons in Production mode
- Shows a warning banner when Production is selected

#### Credentials Input

Enter your OAuth credentials:

- Client ID
- Client Secret
- Username (optional)
- Password (optional)

#### Endpoint Grid

The dashboard displays endpoint buttons organized by category:

- **Metadata**: Clients, currency info, beneficiary fields
- **Quotes**: FX availability, estimate quotes, firm quotes
- **Accounts**: List accounts, balances, details, transactions
- **Beneficiaries**: CRUD operations
- **Trades**: List, details, book trades
- **Payments**: Create, authorize, estimate fees
- **Contacts**: List, details
- **Webhooks**: Subscriptions management

#### Results Panel

- Color-coded test status (green=passed, red=failed, yellow=warning)
- Response viewer with formatted JSON
- Live authentication status
- Rate limiting notifications
- Summary statistics

### 4. Dashboard API Routes

| Route                  | Method | Description                      |
| ---------------------- | ------ | -------------------------------- |
| `/`                    | GET    | Serves the dashboard HTML        |
| `/api/authenticate`    | POST   | Authenticate with credentials    |
| `/api/test/<endpoint>` | POST   | Execute a specific endpoint test |
| `/api/run-all`         | POST   | Run all tests for environment    |
| `/api/results`         | GET    | Get aggregated test results      |

### 5. Safety Features

- **Production Warning**: Banner displayed when Production environment selected
- **Write Button Disabling**: All write operations disabled in Production
- **Rate Limiting**: 100 requests/hour, 20 requests/minute

---

## Using the CLI Test Suites

### Authentication First

Before running any tests, authenticate to get your access token:

```bash
python oauth_flow.py
```

This opens your browser, saves tokens to `.ebury_tokens.json`, and makes them available for all test suites.

### Standard API Testing

Run comprehensive endpoint testing against the sandbox:

```bash
python test_sandbox.py
```

**Test Coverage:** 16 tests covering standard API endpoints

**Capabilities:**
- Dynamic client ID discovery
- Comprehensive error reporting
- Automatic report generation (HTML, Markdown, JSON)
- Auto-updates `LATEST_TEST_SUMMARY_SANDBOX.md`

**Generated Reports:**
- `ebury_test_results_sandbox_YYYYMMDD_HHMMSS.html` - Beautiful visual report
- `ebury_test_results_sandbox_YYYYMMDD_HHMMSS.md` - Markdown report
- `ebury_test_results_sandbox_YYYYMMDD_HHMMSS.json` - Raw data
- `LATEST_TEST_SUMMARY_SANDBOX.md` - Always-current summary (overwrites each run)

### Royalty Payment Testing

Run specialized tests for music royalty payment workflows:

```bash
python test_royalty_payments.py
```

**Test Coverage:** 16 tests for mass payment scenarios

**Business Context:**
- Music royalty payment workflows
- 1200+ payees (artists and record labels)
- Monthly payment cycles
- Multi-currency support (NZD, USD, GBP)
- New Zealand-based company

**Test Categories:**
- Exchange rate retrieval
- Forward rates for payment planning
- Beneficiary management by region
- Trade booking workflows
- Mass payment creation
- Payment reporting and tracking

**Generated Reports:**
- `royalty_test_results_sandbox_YYYYMMDD_HHMMSS.html`
- `royalty_test_results_sandbox_YYYYMMDD_HHMMSS.md`
- `royalty_test_results_sandbox_YYYYMMDD_HHMMSS.json`

### Quick API Validation

Run fast smoke tests on 6 core endpoints:

```bash
python test_api_with_tokens.py
```

**Purpose:** Quick validation that API is working with current tokens

**Test Coverage:** 6 core endpoints (clients, accounts, beneficiaries, trades, payments, contacts)

### Production Testing (Read-Only)

Run read-only testing against production:

```bash
python test_production.py
```

**Safety Features:**
- All write operations blocked
- `PermissionError` raised if write attempted
- Identical test structure to sandbox (minus write operations)

### Current Test Results

**Standard Test Suite (`test_sandbox.py`):**
- Total: 16 tests
- Passing: 13 tests (81.2%)
- Skipped: 3 tests (18.8%)
- Status: ✅ Stable

**Royalty Test Suite (`test_royalty_payments.py`):**
- Total: 16 tests
- Passing: 13 tests (81.2%)
- Skipped: 3 tests (18.8%)
- Status: ✅ Stable

**Combined Coverage:** 32 active tests across both suites

### Test Coverage by Category

#### Metadata Tests

```python
test_get_clients()              # List available clients
test_get_currency_metadata()    # Currency information
test_get_beneficiary_metadata() # Beneficiary field requirements
```

#### Quote Tests

```python
test_fx_availability()    # Check FX availability for currency pairs
test_estimate_quote()     # Get estimate quotes
test_firm_quote()         # Get firm (executable) quotes
```

#### Account Tests

```python
test_list_accounts()       # List all accounts
test_get_account()         # Get account details
test_get_all_balances()    # Get all account balances
test_get_account_balance() # Get single account balance
test_get_transactions()    # List account transactions
```

#### Beneficiary Tests (Sandbox Only for Write Operations)

```python
test_list_beneficiaries()   # List all beneficiaries
test_get_beneficiary()      # Get beneficiary details
test_create_beneficiary()   # Create new beneficiary (sandbox)
test_update_beneficiary()   # Update beneficiary (sandbox)
test_delete_beneficiary()   # Delete beneficiary (sandbox)
```

#### Trade Tests

```python
test_list_trades()    # List all trades
test_get_trade()      # Get trade details
test_book_trade()     # Book a trade from quote (sandbox)
```

#### Payment Tests

```python
test_list_payments()       # List all payments
test_get_payment()         # Get payment details
test_estimate_fee()        # Estimate payment fees
test_create_payment()      # Create payment (sandbox)
test_authorize_payment()   # Authorize payment (sandbox)
test_cancel_payment()      # Cancel payment (sandbox)
```

#### Contact Tests

```python
test_list_contacts()  # List all contacts
test_get_contact()    # Get contact details
```

#### Webhook Tests

```python
test_list_subscriptions()    # List webhook subscriptions
test_create_subscription()   # Create subscription (sandbox)
test_delete_subscription()   # Delete subscription (sandbox)
test_ping_subscription()     # Test webhook endpoint
```

### Test Output

Tests display colored console output:

- Green: Test passed
- Red: Test failed
- Yellow: Warning or skipped
- Blue: Informational

### Automated Report Generation

Every test run automatically generates three types of reports:

**1. HTML Reports** - Beautiful, professional visual reports
- Color-coded test status
- Visual progress bars
- Detailed error information
- Professional formatting for stakeholders

**2. Markdown Reports** - Version-control friendly summaries
- Plain text format
- Easy to track in git
- Quick review in any text editor

**3. JSON Results** - Raw data for programmatic analysis
- Complete test details
- Error messages and stack traces
- Timestamps and metadata

**4. Always-Current Summary** - Quick status check
- `LATEST_TEST_SUMMARY_SANDBOX.md` - Overwrites each run
- Always shows current test status
- Perfect for quick status checks

**Example Report Files:**
```text
ebury_test_results_sandbox_20260109_134303.html
ebury_test_results_sandbox_20260109_134303.md
ebury_test_results_sandbox_20260109_134303.json
LATEST_TEST_SUMMARY_SANDBOX.md  (always current)
```

**Viewing Reports:**
- Open `.html` files in any browser for visual report
- View `.md` files in text editor or GitHub
- Parse `.json` files for automation
- Check `LATEST_TEST_SUMMARY_*.md` for quick status

For complete documentation on report generation, see:
- `docs/REPORT_GENERATION.md` - Complete guide
- `docs/AUTOMATED_REPORTS_SUMMARY.md` - Implementation details

---

## API Endpoints

### Base URLs

| Environment | API URL                    | Auth URL                        |
| ----------- | -------------------------- | ------------------------------- |
| Sandbox     | `https://sandbox.ebury.io` | `https://auth-sandbox.ebury.io` |
| Production  | `https://api.ebury.io`     | `https://auth.ebury.io`         |

### Authentication Endpoints

#### Get Access Token

```http
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id={id}&client_secret={secret}
```

### Metadata Endpoints

#### List Clients

```http
GET /clients
Authorization: Bearer {token}
```

Returns list of accessible clients.

#### Get Currency Metadata

```http
GET /metadata/currency
Authorization: Bearer {token}
```

Returns supported currencies and their properties.

#### Get Beneficiary Field Requirements

```http
GET /metadata/beneficiary?country={country_code}&currency={currency_code}
Authorization: Bearer {token}
```

Returns required fields for beneficiary creation.

### Quote Endpoints

#### Check FX Availability

```http
GET /quotes/fx-availability?sell_currency={sell}&buy_currency={buy}
Authorization: Bearer {token}
```

#### Get Estimate Quote

```http
POST /quotes/estimate
Authorization: Bearer {token}
Content-Type: application/json

{
  "sell_currency": "GBP",
  "buy_currency": "EUR",
  "amount": 10000,
  "side": "sell"
}
```

#### Get Firm Quote

```http
POST /quotes/firm
Authorization: Bearer {token}
Content-Type: application/json

{
  "sell_currency": "GBP",
  "buy_currency": "EUR",
  "amount": 10000,
  "side": "sell"
}
```

### Account Endpoints

**IMPORTANT:** The Ebury API uses **query parameters** for client_id, not path parameters.

#### List Accounts

```http
GET /accounts?client_id={client_id}
Authorization: Bearer {token}
```

#### Get Account Details

```http
GET /accounts/{account_id}?client_id={client_id}
Authorization: Bearer {token}
```

#### Get All Balances

```http
GET /accounts/balances?client_id={client_id}
Authorization: Bearer {token}
```

#### Get Account Transactions

```http
GET /accounts/{account_id}/transactions?client_id={client_id}
Authorization: Bearer {token}
```

Query parameters:

- `page`: Page number
- `page_size`: Results per page
- `from_date`: Start date filter
- `to_date`: End date filter

### Beneficiary Endpoints

#### List Beneficiaries

```http
GET /beneficiaries?client_id={client_id}
Authorization: Bearer {token}
```

#### Get Beneficiary

```http
GET /beneficiaries/{beneficiary_id}?client_id={client_id}
Authorization: Bearer {token}
```

#### Create Beneficiary (Sandbox Only)

```http
POST /beneficiaries?client_id={client_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Test Beneficiary",
  "bank_country": "GB",
  "currency": "GBP",
  "account_number": "12345678",
  "sort_code": "123456"
}
```

#### Update Beneficiary (Sandbox Only)

```http
PATCH /beneficiaries/{beneficiary_id}?client_id={client_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete Beneficiary (Sandbox Only)

```http
DELETE /beneficiaries/{beneficiary_id}?client_id={client_id}
Authorization: Bearer {token}
```

### Trade Endpoints

#### List Trades

```http
GET /trades?client_id={client_id}
Authorization: Bearer {token}
```

#### Get Trade Details

```http
GET /trades/{trade_id}?client_id={client_id}
Authorization: Bearer {token}
```

#### Book Trade (Sandbox Only)

```http
POST /trades?client_id={client_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "quote_id": "quote_123"
}
```

### Payment Endpoints

#### List Payments

```http
GET /payments?client_id={client_id}
Authorization: Bearer {token}
```

#### Get Payment Details

```http
GET /payments/{payment_id}?client_id={client_id}
Authorization: Bearer {token}
```

#### Estimate Payment Fee

```http
GET /payments/estimate-fee?client_id={client_id}&beneficiary_id={ben_id}&amount={amount}&currency={currency}
Authorization: Bearer {token}
```

#### Create Payment (Sandbox Only)

```http
POST /payments?client_id={client_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "beneficiary_id": "ben_123",
  "amount": 1000,
  "currency": "GBP",
  "reference": "Invoice 12345"
}
```

#### Authorize Payment (Sandbox Only)

```http
PATCH /payments/{payment_id}?client_id={client_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "authorize"
}
```

### Contact Endpoints

#### List Contacts

```http
GET /contacts?client_id={client_id}
Authorization: Bearer {token}
```

#### Get Contact Details

```http
GET /contacts/{contact_id}?client_id={client_id}
Authorization: Bearer {token}
```

### Webhook Endpoints

#### List Subscriptions

```http
GET /webhooks/subscriptions
Authorization: Bearer {token}
```

#### Create Subscription (Sandbox Only)

```http
POST /webhooks/subscriptions
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://your-webhook-endpoint.com/webhook",
  "events": ["payment.created", "payment.completed"]
}
```

#### Delete Subscription (Sandbox Only)

```http
DELETE /webhooks/subscriptions/{subscription_id}
Authorization: Bearer {token}
```

---

## Common Workflows

### Workflow 1: First-Time Setup and Authentication

1. **Verify setup**:

   ```bash
   python verify_setup.py
   ```

2. **Authenticate via browser**:

   ```bash
   python oauth_flow.py
   ```

   This opens your browser, you log in, and tokens are saved to `.ebury_tokens.json`.

3. **Test API connectivity**:

   ```bash
   python test_api_with_tokens.py
   ```

   Quick smoke test to verify everything works.

4. **Check results** in the console output or `LATEST_TEST_SUMMARY_SANDBOX.md`.

### Workflow 2: Execute a Trade

1. **Check FX availability**:

   ```http
   GET /quotes/fx-availability?sell_currency=GBP&buy_currency=EUR
   ```

2. **Get estimate quote**:

   ```http
   POST /quotes/estimate
   {
     "sell_currency": "GBP",
     "buy_currency": "EUR",
     "amount": 10000,
     "side": "sell"
   }
   ```

3. **Get firm quote** (valid for limited time):

   ```http
   POST /quotes/firm
   {
     "sell_currency": "GBP",
     "buy_currency": "EUR",
     "amount": 10000,
     "side": "sell"
   }
   ```

4. **Book the trade** using quote ID:

   ```http
   POST /trades?client_id={client_id}
   {
     "quote_id": "quote_123"
   }
   ```

### Workflow 3: Create and Execute a Payment

1. **List beneficiaries** or create new one:

   ```http
   GET /beneficiaries?client_id={client_id}
   ```

2. **Estimate payment fee**:

   ```http
   GET /payments/estimate-fee?client_id={client_id}&beneficiary_id={ben_id}&amount=1000&currency=GBP
   ```

3. **Create payment**:

   ```http
   POST /payments?client_id={client_id}
   {
     "beneficiary_id": "ben_123",
     "amount": 1000,
     "currency": "GBP",
     "reference": "Invoice 12345"
   }
   ```

4. **Authorize payment**:

   ```http
   PATCH /payments/{payment_id}?client_id={client_id}
   {
     "action": "authorize"
   }
   ```

### Workflow 4: Set Up Webhooks

1. **Create subscription**:

   ```http
   POST /webhooks/subscriptions
   {
     "url": "https://your-endpoint.com/webhook",
     "events": ["payment.created", "payment.completed", "trade.completed"]
   }
   ```

2. **Test webhook** with ping:

   ```http
   POST /webhooks/subscriptions/{subscription_id}/ping
   ```

3. **List subscriptions** to verify:

   ```http
   GET /webhooks/subscriptions
   ```

### Workflow 5: Run Full Test Suite

1. **Authenticate first**:

   ```bash
   python oauth_flow.py
   ```

2. **Run standard test suite**:

   ```bash
   python test_sandbox.py
   ```

   Generates HTML, Markdown, and JSON reports automatically.

3. **Run royalty payment tests**:

   ```bash
   python test_royalty_payments.py
   ```

   Tests mass payment workflows for music royalties.

4. **Review results**:

   ```bash
   # Quick status check
   cat LATEST_TEST_SUMMARY_SANDBOX.md

   # Open HTML report in browser
   open ebury_test_results_sandbox_*.html

   # View detailed JSON
   cat ebury_test_results_sandbox_*.json
   ```

### Workflow 6: Daily Development Routine

1. **Start of day** - Refresh token if needed:

   ```bash
   python oauth_flow.py
   ```

2. **Run quick smoke test**:

   ```bash
   python test_api_with_tokens.py
   ```

3. **Make your changes** to the codebase

4. **Run full test suite**:

   ```bash
   python test_sandbox.py
   python test_royalty_payments.py
   ```

5. **Check status**:

   ```bash
   cat LATEST_TEST_SUMMARY_SANDBOX.md
   ```

6. **Review HTML reports** for detailed analysis

---

## Troubleshooting

### Common Issues and Solutions

#### 401 Unauthorized

- **Cause**: Invalid or expired access token
- **Solution**: Re-authenticate using `python oauth_flow.py`

#### 403 Forbidden - client_id missing

- **Cause**: Missing `?client_id=X` query parameter in API request
- **Solution**: Ensure all API calls include `?client_id={your_client_id}` as a query parameter (not path parameter)
- **Example**: Use `/accounts?client_id=EBPCLI285961` not `/clients/EBPCLI285961/accounts`

#### 403 Forbidden - Insufficient Permissions

- **Cause**: API credentials don't have required scopes
- **Solution**: Verify credentials in Ebury Partner Portal have correct permissions

#### No tokens available

- **Cause**: Missing `.ebury_tokens.json` file
- **Solution**: Run `python oauth_flow.py` to authenticate via browser

#### Browser doesn't open during oauth_flow.py

- **Cause**: No default browser configured or headless environment
- **Solution**: Copy the URL from the terminal output and paste it into any browser manually

#### 429 Too Many Requests

- **Cause**: Rate limit exceeded
- **Solution**: Wait for rate limit reset; the test suite includes exponential backoff

#### PermissionError in Production

- **Cause**: Attempted write operation in production environment
- **Solution**: Write operations only allowed in sandbox; use `test_sandbox.py` for CRUD testing

#### Connection Refused

- **Cause**: Flask server not running or wrong port
- **Solution**: Start server with `python app.py` and verify port in `.env`

#### Token Expiration

- **Cause**: Access token expired (3600 second lifetime)
- **Solution**: Use refresh token or re-authenticate

### Error Response Format

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Description of the error",
    "details": {}
  }
}
```

### Common Error Codes

| Code                  | HTTP Status | Description                  |
| --------------------- | ----------- | ---------------------------- |
| `INVALID_CREDENTIALS` | 401         | Invalid client ID or secret  |
| `TOKEN_EXPIRED`       | 401         | Access token has expired     |
| `INSUFFICIENT_SCOPE`  | 403         | Missing required permissions |
| `RESOURCE_NOT_FOUND`  | 404         | Requested resource not found |
| `VALIDATION_ERROR`    | 400         | Invalid request parameters   |
| `RATE_LIMIT_EXCEEDED` | 429         | Too many requests            |
| `QUOTE_EXPIRED`       | 400         | Firm quote has expired       |
| `INSUFFICIENT_FUNDS`  | 400         | Account balance insufficient |

### Debug Mode

Enable debug logging in the Flask dashboard:

```env
FLASK_DEBUG=True
```

For CLI tests, errors are automatically logged with colored output.

---

## Best Practices

### Security

1. **Never commit** `.env` files with credentials
2. **Use environment variables** for all secrets
3. **Rotate credentials** regularly
4. **Use sandbox** for all development and testing
5. **Limit production access** to read-only operations

### Environment Safety

1. **Always start with sandbox** for new integrations
2. **Use `verify_setup.py`** before running tests
3. **Review production warnings** in dashboard
4. **Never bypass** write-operation blocks in production

### Testing

1. **Run verification first**: `python verify_setup.py`
2. **Test sandbox thoroughly** before production
3. **Monitor rate limits** during batch testing
4. **Review JSON results** for comprehensive analysis
5. **Clean up test resources** in sandbox

### Performance

1. **Respect rate limits**: Built-in exponential backoff
2. **Use pagination** for large result sets
3. **Cache metadata** (currency, beneficiary fields)
4. **Reuse access tokens** until expiration

### Development

1. **Use the dashboard** for interactive exploration
2. **Use CLI tests** for automated validation
3. **Review `docs/Ebury_API_Documentation.md`** for detailed reference
4. **Track test results** with JSON exports

### Idempotency

For critical operations, use idempotency keys:

```http
X-Idempotency-Key: unique-request-id-123
```

This prevents duplicate operations if requests are retried.

---

## Project Documentation

The project includes comprehensive documentation organized for easy navigation:

### Quick Reference Documentation (Root Directory)

| File | Purpose |
|------|---------|
| `README.md` | Main project overview and setup guide |
| `QUICK_START.md` | **Start here** - Common commands and quick reference |
| `PROJECT_STRUCTURE.md` | Complete project organization guide |
| `LATEST_TEST_SUMMARY_SANDBOX.md` | **Always current** - Latest test results (auto-updated) |
| `CLEANUP_SUMMARY.md` | Recent codebase cleanup documentation |
| `DOCUMENTATION_INDEX.md` | Complete documentation catalog |

### Detailed Documentation (docs/ Directory)

| File | Purpose |
|------|---------|
| `docs/REPORT_GENERATION.md` | Complete guide to automated report generation |
| `docs/AUTOMATED_REPORTS_SUMMARY.md` | Report system implementation details |
| `docs/Ebury_API_Documentation.md` | Ebury API endpoint reference |

### Generated Reports

Test runs generate timestamped reports in multiple formats:

- `*_results_*.html` - Visual reports for browser viewing
- `*_results_*.md` - Markdown reports for version control
- `*_results_*.json` - Raw data for programmatic analysis
- `LATEST_TEST_SUMMARY_*.md` - Always-current status (overwrites each run)

### Archives

Historical files organized in `archives/` directory:

- `archives/old_tests/` - Deprecated test files
- `archives/test_results/` - Past test results (organized by month)

---

## Additional Resources

- **Ebury Partner Portal**: Credential and account management
- **Ebury API Documentation**: Official docs at <https://docs.ebury.io/>
- **Flask Documentation**: <https://flask.palletsprojects.com/>
- **OAuth2 Specification**: <https://oauth.net/2/>

---

## Quick Reference

### Required Headers

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Common Query Parameters

| Parameter   | Description       | Example      |
| ----------- | ----------------- | ------------ |
| `page`      | Page number       | `1`          |
| `page_size` | Results per page  | `50`         |
| `from_date` | Start date filter | `2024-01-01` |
| `to_date`   | End date filter   | `2024-12-31` |
| `currency`  | Currency filter   | `GBP`        |
| `status`    | Status filter     | `completed`  |

### Common HTTP Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Invalid or expired token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error

### Test Commands

```bash
# Authenticate via browser (run first!)
python oauth_flow.py

# Verify setup
python verify_setup.py

# Quick API validation (6 endpoints)
python test_api_with_tokens.py

# Standard test suite (16 tests)
python test_sandbox.py

# Royalty payment tests (16 tests)
python test_royalty_payments.py

# Production testing (read-only)
python test_production.py

# Interactive dashboard
python app.py

# Check latest results
cat LATEST_TEST_SUMMARY_SANDBOX.md
```
