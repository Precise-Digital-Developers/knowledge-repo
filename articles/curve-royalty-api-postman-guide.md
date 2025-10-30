# Curve Royalty Systems API Using Postman Guide

[Curve Royalty Systems](https://www.curveroyaltysystems.com/) is a platform designed to help music businesses manage royalties by providing tools for tracking, reporting, and distributing earnings from digital streaming platforms and other sources. It offers an API that allows users to extract data related to their music catalogue, earnings, contracts, and more.

The following document is a guide for extracting data from the Curve API using [Postman](https://www.postman.com/).

## 0. Postman Account

If you don't already have one, please sign-up to Postman. Once you have an account, proceed to the rest of the guide.

A member of the Office of the CTO will share the CurveAPI collection with you containing some basic calls to the API.

## 1. Get Authentication Token (POST Request)

Before making any API calls, you need to authenticate and obtain an access token.

**Steps in Postman:**

1. Open Postman, either in your browser or with the desktop app.

2. Create a new request.

3. Select POST as the request type.

4. Enter the URL:

   ```
   https://api.curveroyaltysystems.com/authenticate?applicationToken=K5DuDFvugb
   ```

5. Click **Send**.

6. The response body will include an access token called `token` that you must use in subsequent API requests.

![Authentication Response](media/curve-api-auth.png)

## 2. Retrieve Data from the API (GET Requests)

Once authenticated, you can use the access token to retrieve data from different API endpoints.

**General Steps in Postman:**

1. Create a new request.

2. Select GET as the request type.

3. Enter the endpoint URL (see documentation: [Curve API Docs](https://api.curveroyaltysystems.com/api-docs/)).

4. In the **Headers** tab, add:
   - Key: `Authorization`
   - Value: `Bearer YOUR_ACCESS_TOKEN`

5. Click **Send** to retrieve the data.

## 3. Example API Calls Using IDs and Parameters

### Example 1: Get Account Information

**Endpoint:**

```
https://api.curveroyaltysystems.com/api/account
```

**Steps in Postman:**

- Method: GET
- Headers:
  - Authorization: Bearer YOUR_ACCESS_TOKEN

### Example 2: Get a Specific Report by ID

To fetch details of a specific report, you need to pass the reportId.

**Endpoint:**

```
https://api.curveroyaltysystems.com/api/reports/{reportId}
```

**Replace {reportId} with an actual ID.**

Example:

```
https://api.curveroyaltysystems.com/api/reports/12345
```

### Example 3: Fetch Earnings for a Given Period

To get earnings data, you may need to include query parameters for filtering.

**Endpoint:**

```
https://api.curveroyaltysystems.com/api/earnings
```

**Example Request with Query Parameters:**

```
https://api.curveroyaltysystems.com/api/earnings?startDate=2024-01-01&endDate=2024-01-31
```

**Query Parameters:**

- `startDate` -- Beginning of the period (YYYY-MM-DD)
- `endDate` -- End of the period (YYYY-MM-DD)

## 4. Handling Responses

After making requests, you will receive a JSON response. Example:

```json
{
  "reportId": 12345,
  "date": "2024-01-31",
  "earnings": 10000,
  "currency": "USD"
}
```

## 5. Notes

- **Use the access token in all GET requests** to authenticate.
- **Check API docs** for required parameters per endpoint.
- **Use environment variables** in Postman for managing API tokens dynamically.

### Useful Links

- [Curve API Documentation](https://api.curveroyaltysystems.com/api-docs/#)
- [Postman Learning Center](https://learning.postman.com/docs/introduction/overview/)
- [Curve Data Viewer GitHub Repository](https://github.com/Precise-Digital-Developers/curveDataViewer/tree/main)
