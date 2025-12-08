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
- **OAuth2 Authentication**: Support for client credentials and user authentication flows
- **Safety Controls**: Production write-operation blocking prevents accidental modifications
- **Result Tracking**: JSON export with timestamps and test summaries

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
├── config.py                    # Configuration and endpoint catalog
├── base_test.py                 # Base test class with common functionality
├── test_sandbox.py              # Sandbox tests (full CRUD operations)
├── test_production.py           # Production tests (read-only)
├── app.py                       # Flask dashboard for visual testing
├── verify_setup.py              # Setup verification utility
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment template
├── .env                         # Your credentials (gitignored)
├── .gitignore                   # Git ignore rules
├── docs/
│   └── Ebury_API_Documentation.md  # Detailed API documentation
└── README.md                    # Quick start guide
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

### OAuth2 Authentication

Ebury uses OAuth2 for API authentication with multiple supported flows.

### Client Credentials Flow

Used for server-to-server API access (most common):

```http
POST /oauth/token
Host: auth-sandbox.ebury.io
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials&client_id={client_id}&client_secret={client_secret}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_value"
}
```

### User Authentication Flow

Used for browser-based applications with 2FA support:

```http
POST /oauth/token
Host: auth-sandbox.ebury.io
Content-Type: application/x-www-form-urlencoded

grant_type=password&client_id={client_id}&client_secret={client_secret}&username={username}&password={password}
```

### Refresh Token Flow

Extend sessions without re-authentication:

```http
POST /oauth/token
Host: auth-sandbox.ebury.io
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&client_id={client_id}&client_secret={client_secret}&refresh_token={refresh_token}
```

### Token Details

| Token Type    | Validity      | Usage                     |
| ------------- | ------------- | ------------------------- |
| Access Token  | 3600 sec      | API request authorization |
| Refresh Token | Up to 28 days | Obtain new access tokens  |

### Using Tokens

Include the access token in all API requests:

```http
Authorization: Bearer {access_token}
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

### Sandbox Testing (Full CRUD)

Run full CRUD testing against the sandbox environment:

```bash
python test_sandbox.py
```

**Capabilities:**

- Create, Read, Update, Delete operations
- Resource tracking and cleanup
- Dynamic client ID discovery
- Comprehensive error reporting

### Production Testing (Read-Only)

Run read-only testing against production:

```bash
python test_production.py
```

**Safety Features:**

- All write operations blocked
- `PermissionError` raised if write attempted
- Identical test structure to sandbox (minus write operations)

### Test Coverage

The CLI suites include 40+ test methods organized by category:

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

### Result Files

Tests export results to JSON files:

```
ebury_test_results_sandbox_YYYYMMDD_HHMMSS.json
ebury_test_results_production_YYYYMMDD_HHMMSS.json
```

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

#### List Accounts

```http
GET /clients/{client_id}/accounts
Authorization: Bearer {token}
```

#### Get Account Details

```http
GET /clients/{client_id}/accounts/{account_id}
Authorization: Bearer {token}
```

#### Get All Balances

```http
GET /clients/{client_id}/accounts/balances
Authorization: Bearer {token}
```

#### Get Account Transactions

```http
GET /clients/{client_id}/accounts/{account_id}/transactions
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
GET /clients/{client_id}/beneficiaries
Authorization: Bearer {token}
```

#### Get Beneficiary

```http
GET /clients/{client_id}/beneficiaries/{beneficiary_id}
Authorization: Bearer {token}
```

#### Create Beneficiary (Sandbox Only)

```http
POST /clients/{client_id}/beneficiaries
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
PATCH /clients/{client_id}/beneficiaries/{beneficiary_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name"
}
```

#### Delete Beneficiary (Sandbox Only)

```http
DELETE /clients/{client_id}/beneficiaries/{beneficiary_id}
Authorization: Bearer {token}
```

### Trade Endpoints

#### List Trades

```http
GET /clients/{client_id}/trades
Authorization: Bearer {token}
```

#### Get Trade Details

```http
GET /clients/{client_id}/trades/{trade_id}
Authorization: Bearer {token}
```

#### Book Trade (Sandbox Only)

```http
POST /clients/{client_id}/trades
Authorization: Bearer {token}
Content-Type: application/json

{
  "quote_id": "quote_123"
}
```

### Payment Endpoints

#### List Payments

```http
GET /clients/{client_id}/payments
Authorization: Bearer {token}
```

#### Get Payment Details

```http
GET /clients/{client_id}/payments/{payment_id}
Authorization: Bearer {token}
```

#### Estimate Payment Fee

```http
POST /clients/{client_id}/payments/estimate-fee
Authorization: Bearer {token}
Content-Type: application/json

{
  "beneficiary_id": "ben_123",
  "amount": 1000,
  "currency": "GBP"
}
```

#### Create Payment (Sandbox Only)

```http
POST /clients/{client_id}/payments
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
PATCH /clients/{client_id}/payments/{payment_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "action": "authorize"
}
```

### Contact Endpoints

#### List Contacts

```http
GET /clients/{client_id}/contacts
Authorization: Bearer {token}
```

#### Get Contact Details

```http
GET /clients/{client_id}/contacts/{contact_id}
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

### Workflow 1: Test API Connectivity

1. **Verify setup**:

   ```bash
   python verify_setup.py
   ```

2. **Authenticate via CLI**:

   ```bash
   python test_sandbox.py
   # First test authenticates and checks client access
   ```

3. **Check results** for authentication success.

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
   POST /clients/{client_id}/trades
   {
     "quote_id": "quote_123"
   }
   ```

### Workflow 3: Create and Execute a Payment

1. **List beneficiaries** or create new one:

   ```http
   GET /clients/{client_id}/beneficiaries
   ```

2. **Estimate payment fee**:

   ```http
   POST /clients/{client_id}/payments/estimate-fee
   {
     "beneficiary_id": "ben_123",
     "amount": 1000,
     "currency": "GBP"
   }
   ```

3. **Create payment**:

   ```http
   POST /clients/{client_id}/payments
   {
     "beneficiary_id": "ben_123",
     "amount": 1000,
     "currency": "GBP",
     "reference": "Invoice 12345"
   }
   ```

4. **Authorize payment**:

   ```http
   PATCH /clients/{client_id}/payments/{payment_id}
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

1. **Sandbox (full CRUD)**:

   ```bash
   python test_sandbox.py
   ```

2. **Production (read-only)**:

   ```bash
   python test_production.py
   ```

3. **Review JSON results**:

   ```bash
   cat ebury_test_results_sandbox_*.json
   ```

---

## Troubleshooting

### Common Issues and Solutions

#### 401 Unauthorized

- **Cause**: Invalid or expired access token
- **Solution**: Re-authenticate using client credentials or refresh token

#### 403 Forbidden

- **Cause**: Insufficient permissions or wrong client ID
- **Solution**: Verify client ID and API credentials have required scopes

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

## Additional Resources

- **Ebury Partner Portal**: Credential and account management
- **Ebury API Documentation**: `docs/Ebury_API_Documentation.md`
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
# Verify setup
python verify_setup.py

# Sandbox testing (full CRUD)
python test_sandbox.py

# Production testing (read-only)
python test_production.py

# Interactive dashboard
python app.py
```
