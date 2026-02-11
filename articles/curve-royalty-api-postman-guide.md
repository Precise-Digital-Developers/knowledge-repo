# Curve Royalty Systems API Using Postman Guide

[Curve Royalty Systems](https://www.curveroyaltysystems.com/) is a platform designed to help music businesses manage royalties by providing tools for tracking, reporting, and distributing earnings from digital streaming platforms and other sources. It offers an API that allows users to extract data related to their music catalogue, earnings, contracts, and more.

The following document is a guide for extracting data from the Curve API using [Postman](https://www.postman.com/).

## 0. Postman Account

If you don't already have one, please sign-up to Postman. Once you have an account, proceed to the rest of the guide.

A member of the Office of the CTO will share the CurveAPI collection with you containing read-only calls to the API (version 1.10.0).

## 0.1 Collection Variables Setup

Before making any API calls, you need to configure the collection variables:

1. Open the CurveAPI collection in Postman
2. Navigate to the **Variables** tab
3. Set the following variables:
   - `base_url`: `https://api.curveroyaltysystems.com` (default)
   - `application_token`: Your application token provided by Curve
   - `api_key`: Your API key
   - `api_secret_key`: Your API secret key
   - `auth_token`: Leave empty (this will be auto-populated after authentication)

These variables will be used across all requests in the collection.

## 1. Get Authentication Token (POST Request)

Before making any API calls, you need to authenticate and obtain an access token.

**Steps in Postman:**

1. Open the **Authentication** folder in the CurveAPI collection.

2. Select the **Authenticate** request.

3. The request is already configured with:
   - Method: **POST**
   - URL: `{{base_url}}/authenticate?applicationToken={{application_token}}`
   - Headers:
     - `applicationToken`: `{{application_token}}`
     - `Content-Type`: `application/json`
   - Body (raw JSON):

     ```json
     {
       "apiKey": "{{api_key}}",
       "apiSecretKey": "{{api_secret_key}}"
     }
     ```

4. Click **Send**.

5. The response body will include an access token called `token`:

   ```json
   {
     "token": "your-access-token-here"
   }
   ```

6. The collection includes an automatic script that saves this token to the `auth_token` variable for use in subsequent requests.

## 2. Retrieve Data from the API (GET Requests)

Once authenticated, you can use the access token to retrieve data from different API endpoints.

**General Steps in Postman:**

All requests in the collection are pre-configured with authentication. The collection automatically uses the `auth_token` variable that was saved during authentication.

1. Navigate to any folder in the collection (e.g., Clients, Contracts, Releases, etc.).

2. Select the desired request.

3. The request headers are already configured with:
   - Key: `token`
   - Value: `{{auth_token}}`

4. The URL includes the `applicationToken` query parameter automatically:

   ```
   {{base_url}}/endpoint?applicationToken={{application_token}}
   ```

5. Click **Send** to retrieve the data.

## 3. Example API Calls and Available Resources

The Curve API v1.10.0 collection includes read-only requests organized into the following categories:

### Available Resource Folders

- **Accounting Periods** - Retrieve and manage accounting periods, sales files, and history
- **Analytics** - Run analytics queries for detailed reporting with filters and comparisons
- **Clients** - Access client information
- **Companies** - Retrieve company data and history
- **Composers** - Access composer information
- **Contract Term Groups** - Access contract term group data and history
- **Contracts** - Retrieve contract details, releases, tracks, works, costs, transactions, and future transactions
- **Costs** - Retrieve cost information and history
- **CWR Acknowledgements** - Manage CWR (Common Works Registration) acknowledgement data, deliveries, and exports
- **CWR Deliveries** - Manage CWR delivery scheduling, export, and work redelivery
- **Delivered Works** - Retrieve delivered works data
- **Delivery Logs** - Access delivery log records
- **Delivery Partners** - Access delivery partner configuration and listings
- **Delivery Profiles** - Retrieve delivery profile configurations
- **Delivery Schedules** - Access delivery schedules and queued works
- **Fixed Reports** - Retrieve pre-configured reports
- **Import Partners** - Access import partner configurations
- **Imports** - Access import data, history, and error exports
- **Invoices** - Retrieve invoice information
- **ISWC Acknowledgements** - Manage ISWC (International Standard Musical Work Code) acknowledgement data
- **ISWC Deliveries** - Manage ISWC deliveries, work exports, and delivery actions
- **Library Templates** - Access library template configurations and history
- **MCPS Negatives** - Retrieve MCPS negatives data and history
- **MCPS Retentions** - Retrieve MCPS retention data and history
- **Notifications** - Access system notifications, counts, and mark-as-read
- **Output Sales** - Retrieve output sales data and totals
- **Parents** - Access parent entity information and history
- **Payees** - Retrieve payee details, summaries, balances, contracts, transactions, and statements
- **Payments** - Access payment information and history
- **Periods** - Retrieve detailed period information, sales files, costs, batch tasks, QA reports, and statement management
- **Publishers** - Access publisher information and history
- **Releases** - Access release data, history, and tracks
- **Reports** - Retrieve, export, and display royalty reports
- **Sales** - Access individual sales records
- **Sales Files** - Access sales file information, filter options, and bulk operations
- **Sales Templates** - Retrieve sales template configurations and history
- **Search** - Search across multiple resource types
- **Spotify** - Search Spotify catalogue data
- **Statements** - Retrieve statements, analytics, transactions, sales files, and costs per statement
- **Territory Groups** - Access territory group configurations and history
- **Tracks** - Retrieve track data, history, and associated releases
- **Transactions** - Access individual transaction records
- **Unmapped Releases** - Retrieve unmapped release data and history
- **Unmapped Tracks** - Retrieve unmapped track data and history
- **Unmapped Works** - Retrieve unmapped work data and history
- **Users** - Access user information, associated clients, and payees
- **Works** - Access work information, delivery statuses, deliveries, history, and source data

### Example 1: Retrieve All Clients

Navigate to **Clients** > **Retrieve all clients**

**Endpoint:**

```
{{base_url}}/clients?applicationToken={{application_token}}&limit=100
```

**Method:** GET

**Query Parameters:**

- `limit` - Number of results to return (default: 100)

### Example 2: Get a Specific Client by ID

Navigate to **Clients** > **Retrieve a specific client**

**Endpoint:**

```
{{base_url}}/clients/:id?applicationToken={{application_token}}
```

**Method:** GET

**Path Variables:**

- `id` - The client ID (replace with actual ID)

### Example 3: Retrieve Accounting Periods

Navigate to **Accounting Periods** > **Retrieve accounting periods**

**Endpoint:**

```
{{base_url}}/accountingPeriods?applicationToken={{application_token}}&limit=100
```

**Method:** GET

**Query Parameters:**

- `limit` - Number of results to return

### Example 4: Run Analytics Queries (POST Request)

Navigate to **Analytics** > **Run analytics queries**

**Endpoint:**

```
{{base_url}}/detail?applicationToken={{application_token}}
```

**Method:** POST

**Body (raw JSON):**

```json
{
  "filter": [
    {
      "releaseIds": {
        "includeTracksWithRelease": true,
        "releaseIds": ["id"]
      }
    }
  ],
  "comparison": true,
  "outputs": [
    {
      "outputs": [
        "distributionChannels",
        "configurations",
        "territories",
        "sources",
        "subSources",
        "catalogue",
        "revenueOverTime",
        "costs",
        "topArtists",
        "topLabels",
        "averageStreamRates",
        "contractBreakdown"
      ]
    }
  ]
}
```

**Available Query Parameters for Filtering:**

- `companies` - Filter by company IDs (array)
- `contractIds` - Filter by contract IDs (array)
- `calculationTypes` - Filter by calculation types
- `contractCategories` - Filter by contract categories
- `periodIds` - Filter by period IDs (array)
- `salesFileIds` - Filter by sales file IDs (array)
- `catType` - Catalogue type: `Release`, `Track`, or `Contract`
- `targetPeriod` - Target period filter
- `foreignId` - Foreign ID filter
- `distributionChannels` - Filter by channel: `Digital`, `Physical`, `Performance`, `Licensing`, `Sync`, `Merchandise`, `Other`
- `configurations` - Filter by format: `CD`, `DVD`, `LP`, `Download`, `Premium Stream`, `Ad-funded Stream`, etc.
- `territories` - Filter by territory codes (array, e.g., `US`, `UK`)
- `priceCategories` - Filter by price tier: `Full Price`, `Mid Price`, `Budget`
- `catalogueGroups` - Filter by catalogue groups
- `releaseIds` - Filter by release IDs (array)
- `trackIds` - Filter by track IDs (array)
- `workIds` - Filter by work IDs (array)
- `saleDate` - Filter by sale date (format: `YYYY-MM-DD`)
- `transactionDate` - Filter by transaction date (format: `YYYY-MM-DD`)

> **Note:** These query parameters are disabled by default in the Postman collection. Enable the ones you need for your specific query.

### Example 5: Retrieve Payees

Navigate to **Payees** > **Retrieve a list of Payees**

**Endpoint:**

```
{{base_url}}/payees?applicationToken={{application_token}}&limit=100
```

**Method:** GET

**Query Parameters:**

- `limit` - Number of results to return (default: 100)

**Related Sub-Endpoints:**

- `/payees/:id` - Get a specific payee
- `/payees/:id/summary` - Payee summary overview
- `/payees/:id/detail` - Detailed payee information
- `/payees/:id/payee_balance` - Payee balance
- `/payees/:id/contracts` - Contracts for a payee (via `/payees/:id/get_contracts_and_transactions`)
- `/payees/:id/transactions` - Transactions for a payee
- `/payees/:id/statements` - Statements for a payee
- `/payees/:id/users` - Users associated with a payee

### Example 6: Retrieve Statements

Navigate to **Statements** > **Retrieve a list of Statements**

**Endpoint:**

```
{{base_url}}/statements?applicationToken={{application_token}}&limit=100
```

**Method:** GET

**Query Parameters:**

- `limit` - Number of results to return
- `periodId` - Filter statements by period ID
- `payeeId` - Filter statements by payee ID

**Related Sub-Endpoints:**

- `/statements/:id` - Get a specific statement
- `/statements/:id/detail` - Statement analytics
- `/statements/:id/transactions` - Transactions within a statement
- `/statements/:id/sales_files` - Sales files for a statement
- `/statements/:id/costs` - Costs for a statement
- `/statements/:id/send` - Send a statement
- `/statements/periods` - List periods that have statements

### Example 7: Search Across Resources

Navigate to **Search** > **Search across multiple resources**

**Endpoint:**

```
{{base_url}}/search?applicationToken={{application_token}}&q=search-term
```

**Method:** GET

**Query Parameters:**

- `q` - Search query string

## 4. Handling Responses

After making requests, you will receive a JSON response. The structure varies by endpoint, but typically includes the requested data in JSON format.

**Example Response from Authentication:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Example Response from Retrieve Clients:**

```json
{
  "data": [
    {
      "id": "12345",
      "name": "Client Name",
      "email": "client@example.com",
      "status": "active"
    }
  ],
  "total": 150,
  "limit": 100
}
```

## 5. Important Notes

- **Authentication Required**: The `auth_token` must be obtained before making any data requests. Run the **Authenticate** request first.
- **Read-Only Collection**: This collection (v1.10.0) contains only read-only requests. No data modifications are possible through these endpoints.
- **Automatic Token Management**: The collection automatically saves and uses the authentication token via the `auth_token` variable.
- **Collection Variables**: Ensure all required variables (`application_token`, `api_key`, `api_secret_key`) are configured before use.
- **Query Parameters**: Most endpoints support filtering and pagination through query parameters like `limit`, `offset`, and resource-specific filters.
- **Path Variables**: Some endpoints require specific IDs in the path (e.g., `/clients/:id`). Replace `:id` with the actual resource ID.

## 6. Tips for Using the Collection

1. **Start with Authentication**: Always run the Authenticate request first in each session.
2. **Use Folders for Organization**: The collection is organized by resource type for easy navigation.
3. **Check Request Documentation**: Each request includes a description explaining its purpose.
4. **Explore History Endpoints**: Many resources have associated history endpoints (e.g., `/contracts/:id/history`) to track changes.
5. **Leverage Analytics**: Use the Analytics endpoint for complex queries across multiple data points.
6. **Review Query Parameters**: Check disabled query parameters in requests to see available filtering options.

## 7. Useful Links

- [Curve API Documentation](https://app.curveroyaltysystems.com/#/api-docs)
- [Postman Learning Center](https://learning.postman.com/docs/introduction/overview/)
- [Curve Data Viewer GitHub Repository](https://github.com/Precise-Digital-Developers/curveDataViewer/tree/main)
- [Curve Royalty Systems](https://www.curveroyaltysystems.com/)
