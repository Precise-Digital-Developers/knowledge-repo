# Trend Data Platform API - Testing Guide

## Overview

This guide explains how to use the Postman collection to test and interact with the Trend Data Platform API. The collection provides pre-configured requests for all major API endpoints.

## Quick Start

### 1. Import the Postman Collection

1. Open Postman
2. Click **Import** in the top left
3. Select **File** tab
4. Navigate to: `Trend_Data_Platform_API.postman_collection.json`
5. Click **Open** to import

### 2. Configure the Base URL

The collection uses a variable for the base URL:

- **Default**: `https://trend-data-api.onrender.com`
- **To change**:
  1. Click on the collection name
  2. Go to **Variables** tab
  3. Update `baseUrl` value
  4. Save changes

### 3. Start Testing

All endpoints are organized into logical folders. Simply select a request and click **Send**.

---

## API Endpoints Reference

### 1. Health & Info

#### GET Health Check
```
GET {{baseUrl}}/health
```
**Purpose**: Verify the API is running and check database connectivity

**Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-03T10:00:00Z"
}
```

#### GET API Info
```
GET {{baseUrl}}/
```
**Purpose**: Get API version and available endpoints

**Response**:
```json
{
  "name": "Trend Data Platform API",
  "version": "1.0.0",
  "endpoints": [...]
}
```

---

### 2. Artists

#### GET Search Artists
```
GET {{baseUrl}}/api/artists/search?q=Fejoint
```
**Purpose**: Search for artists by name

**Query Parameters**:
- `q` (required): Search query string

**Response**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "Fejoint",
      "name_normalized": "fejoint",
      "total_tracks": 5,
      "created_at": "2025-10-03T09:00:00Z"
    }
  ],
  "total": 1
}
```

#### GET Artists (Paginated)
```
GET {{baseUrl}}/api/artists?page=1&page_size=20
```
**Purpose**: Get paginated list of all artists

**Query Parameters**:
- `page` (default: 1): Page number
- `page_size` (default: 20): Items per page

**Response**:
```json
{
  "artists": [...],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

#### GET Artist by ID
```
GET {{baseUrl}}/api/artists/1
```
**Purpose**: Get detailed information about a specific artist

**Response**:
```json
{
  "id": 1,
  "name": "Fejoint",
  "name_normalized": "fejoint",
  "genre": "Reggae",
  "country": "NZ",
  "total_tracks": 5,
  "total_streams": 1500000,
  "created_at": "2025-10-03T09:00:00Z"
}
```

#### GET Artist Stats
```
GET {{baseUrl}}/api/artists/1/stats
```
**Purpose**: Get streaming statistics for an artist

**Response**:
```json
{
  "artist_id": 1,
  "artist_name": "Fejoint",
  "total_streams": 1500000,
  "total_tracks": 5,
  "platforms": {
    "spotify": 800000,
    "apple_music": 500000,
    "other": 200000
  },
  "top_countries": [
    {"country": "NZ", "streams": 600000},
    {"country": "AU", "streams": 400000}
  ],
  "demographics": {
    "age_bucket": {
      "18-24": 450000,
      "25-29": 350000
    },
    "gender": {
      "female": 750000,
      "male": 700000
    }
  }
}
```

#### GET Top Artists
```
GET {{baseUrl}}/api/artists/top?limit=10&days=30
```
**Purpose**: Get top performing artists by stream count

**Query Parameters**:
- `limit` (default: 10): Number of artists to return
- `days` (default: 30): Time period in days

**Response**:
```json
{
  "artists": [
    {
      "id": 1,
      "name": "Fejoint",
      "total_streams": 1500000,
      "rank": 1
    }
  ],
  "period_days": 30,
  "generated_at": "2025-10-03T10:00:00Z"
}
```

---

### 3. Tracks

#### GET Search Tracks
```
GET {{baseUrl}}/api/tracks/search?q=Come%20Closer
```
**Purpose**: Search for tracks by title

**Query Parameters**:
- `q` (required): Search query string

**Response**:
```json
{
  "results": [
    {
      "id": 1,
      "title": "Come Closer",
      "isrc": "NZAM02100697",
      "artist_name": "Fejoint",
      "total_streams": 800000
    }
  ],
  "total": 1
}
```

#### GET Track by ID
```
GET {{baseUrl}}/api/tracks/1
```
**Purpose**: Get detailed information about a specific track

**Response**:
```json
{
  "id": 1,
  "title": "Come Closer",
  "isrc": "NZAM02100697",
  "album_name": "Pacific Vibes",
  "duration_ms": 210000,
  "genre": "Reggae",
  "artist": {
    "id": 1,
    "name": "Fejoint"
  },
  "total_streams": 800000
}
```

#### GET Track Stats
```
GET {{baseUrl}}/api/tracks/1/stats
```
**Purpose**: Get streaming statistics for a track

**Response**:
```json
{
  "track_id": 1,
  "track_title": "Come Closer",
  "isrc": "NZAM02100697",
  "total_streams": 800000,
  "platforms": {
    "spotify": 500000,
    "apple_music": 200000
  },
  "top_countries": [...],
  "demographics": {...}
}
```

#### GET Top Tracks
```
GET {{baseUrl}}/api/tracks/top?limit=10&days=7
```
**Purpose**: Get top performing tracks

**Query Parameters**:
- `limit` (default: 10): Number of tracks to return
- `days` (default: 30): Time period in days

---

### 4. Streaming Records

#### POST Query Streaming Records
```
POST {{baseUrl}}/api/streaming/query
Content-Type: application/json

{
  "start_date": "2023-01-01",
  "end_date": "2023-01-31",
  "platform": "spotify",
  "country": "NZ",
  "artist_id": 1,
  "track_id": 1,
  "demographics": {
    "age_bucket": "18-24",
    "gender": "female"
  },
  "page": 1,
  "page_size": 100
}
```
**Purpose**: Query streaming records with flexible filters

**Request Body**:
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)
- `platform` (optional): Platform code (spotify, apple, etc.)
- `country` (optional): ISO country code
- `artist_id` (optional): Artist ID
- `track_id` (optional): Track ID
- `demographics` (optional): Demographic filters
  - `age_bucket`: Age range (e.g., "18-24")
  - `gender`: Gender (male, female, neutral)
- `page` (optional): Page number
- `page_size` (optional): Records per page

**Response**:
```json
{
  "records": [
    {
      "id": 1,
      "date": "2023-01-15",
      "platform": "spotify",
      "artist_name": "Fejoint",
      "track_title": "Come Closer",
      "metric_value": 1500,
      "geography": "NZ",
      "user_demographic": {
        "age_bucket": "18-24",
        "gender": "female"
      }
    }
  ],
  "total": 456,
  "page": 1,
  "page_size": 100
}
```

#### GET Streaming Record by ID
```
GET {{baseUrl}}/api/streaming/1
```
**Purpose**: Get a specific streaming record

#### POST Aggregate Streaming Data
```
POST {{baseUrl}}/api/streaming/aggregate
Content-Type: application/json

{
  "start_date": "2023-01-01",
  "end_date": "2023-01-31",
  "group_by": ["platform", "country"],
  "filters": {
    "artist_id": 1
  }
}
```
**Purpose**: Aggregate streaming data by dimensions

**Request Body**:
- `start_date` (required): Start date
- `end_date` (required): End date
- `group_by` (required): Array of dimensions to group by
  - Options: `platform`, `country`, `artist`, `track`, `date`
- `filters` (optional): Additional filters

**Response**:
```json
{
  "aggregations": [
    {
      "platform": "spotify",
      "country": "NZ",
      "total_streams": 150000,
      "unique_tracks": 5
    }
  ],
  "period": {
    "start": "2023-01-01",
    "end": "2023-01-31"
  }
}
```

#### GET Timeseries Data
```
GET {{baseUrl}}/api/streaming/timeseries?start_date=2023-01-01&end_date=2023-01-31&interval=day&artist_id=1
```
**Purpose**: Get time-series streaming data

**Query Parameters**:
- `start_date` (required): Start date
- `end_date` (required): End date
- `interval` (required): Time interval (hour, day, week, month)
- `artist_id` (optional): Filter by artist
- `track_id` (optional): Filter by track
- `platform` (optional): Filter by platform

**Response**:
```json
{
  "timeseries": [
    {
      "date": "2023-01-01",
      "streams": 5000
    },
    {
      "date": "2023-01-02",
      "streams": 6200
    }
  ],
  "interval": "day",
  "total_streams": 150000
}
```

---

### 5. Platforms

#### GET All Platforms
```
GET {{baseUrl}}/api/platforms
```
**Purpose**: Get list of all streaming platforms

**Response**:
```json
{
  "platforms": [
    {
      "id": 1,
      "name": "Spotify",
      "code": "spo-spotify",
      "description": "Spotify streaming platform",
      "active": true
    }
  ]
}
```

#### GET Platform by ID
```
GET {{baseUrl}}/api/platforms/1
```
**Purpose**: Get details of a specific platform

#### GET Platform Stats
```
GET {{baseUrl}}/api/platforms/1/stats
```
**Purpose**: Get streaming statistics for a platform

**Response**:
```json
{
  "platform_id": 1,
  "platform_name": "Spotify",
  "total_streams": 5000000,
  "total_tracks": 150,
  "total_artists": 45,
  "date_range": {
    "earliest": "2022-12-01",
    "latest": "2023-01-31"
  }
}
```

---

### 6. Data Quality

#### GET Data Quality Overview
```
GET {{baseUrl}}/api/quality/overview
```
**Purpose**: Get overall data quality metrics

**Response**:
```json
{
  "total_records": 1500000,
  "records_with_demographics": 1485000,
  "demographic_coverage": 99.0,
  "platforms_active": 5,
  "data_freshness": {
    "latest_record": "2023-01-31",
    "hours_since_update": 2
  },
  "issues": [
    {
      "type": "missing_isrc",
      "count": 150,
      "severity": "medium"
    }
  ]
}
```

#### GET Processing Logs
```
GET {{baseUrl}}/api/quality/logs?page=1&page_size=50
```
**Purpose**: Get file processing logs

**Query Parameters**:
- `page` (default: 1): Page number
- `page_size` (default: 50): Logs per page
- `status` (optional): Filter by status (completed, failed)

**Response**:
```json
{
  "logs": [
    {
      "id": 1,
      "file_name": "precise-digital-limited_TOPD_MLN_W_2023_04.csv",
      "platform": "Spotify",
      "processing_status": "completed",
      "records_processed": 2387,
      "records_failed": 0,
      "quality_score": 80.0,
      "completed_at": "2023-01-31T10:30:00Z"
    }
  ],
  "total": 243,
  "page": 1
}
```

#### GET Platform Data Quality
```
GET {{baseUrl}}/api/quality/platform/1
```
**Purpose**: Get data quality metrics for a specific platform

---

### 7. Alerts & Monitoring

#### GET Unknown Platform Alerts
```
GET {{baseUrl}}/api/alerts/unknown-platforms
```
**Purpose**: Get alerts for files from unknown/unmapped platforms

**Response**:
```json
{
  "alerts": [
    {
      "id": 1,
      "file_path": "/data/202301/unknown-platform/file.csv",
      "detected_pattern": "unknown-platform",
      "alert_status": "new",
      "created_at": "2023-01-31T15:00:00Z"
    }
  ],
  "total_unresolved": 3
}
```

---

## Common Use Cases

### Use Case 1: Get Demographic Insights

**Goal**: Find out what percentage of listeners are 18-24 year old females

```
POST {{baseUrl}}/api/streaming/query

{
  "artist_id": 1,
  "start_date": "2023-01-01",
  "end_date": "2023-01-31",
  "demographics": {
    "age_bucket": "18-24",
    "gender": "female"
  }
}
```

Then compare with total streams for the artist in the same period.

### Use Case 2: Track Performance Across Platforms

**Goal**: Compare how a track performs on different platforms

```
POST {{baseUrl}}/api/streaming/aggregate

{
  "start_date": "2023-01-01",
  "end_date": "2023-01-31",
  "group_by": ["platform"],
  "filters": {
    "track_id": 1
  }
}
```

### Use Case 3: Geographic Performance

**Goal**: See which countries are streaming an artist the most

```
GET {{baseUrl}}/api/artists/1/stats
```

Look at the `top_countries` section in the response.

### Use Case 4: Monitor Data Pipeline

**Goal**: Check if data processing is working correctly

```
GET {{baseUrl}}/api/quality/overview
GET {{baseUrl}}/api/quality/logs?status=failed
```

---

## Tips & Best Practices

### 1. Use Environment Variables

Create Postman environments for different deployments:

- **Production**: `https://trend-data-api.onrender.com`
- **Development**: `http://localhost:8000`

### 2. Save Responses as Examples

After getting successful responses:
1. Click **Save Response**
2. Select **Save as example**
3. This helps document expected responses

### 3. Use Collection Variables for IDs

Store commonly used IDs as collection variables:
```
{{artist_id}} = 1
{{track_id}} = 5
```

### 4. Chain Requests

Use Postman's **Tests** tab to extract data from responses:

```javascript
// Extract artist ID from search response
const response = pm.response.json();
pm.collectionVariables.set("artist_id", response.results[0].id);
```

Then use `{{artist_id}}` in subsequent requests.

### 5. Date Formatting

Always use ISO 8601 date format:
- ✅ `2023-01-31`
- ❌ `31/01/2023`
- ❌ `01-31-2023`

---

## Troubleshooting

### Error: Connection Refused

**Cause**: API is not running or wrong base URL

**Solution**:
1. Check API health: `GET {{baseUrl}}/health`
2. Verify base URL is correct
3. Ensure API service is running

### Error: 404 Not Found

**Cause**: Incorrect endpoint path or resource doesn't exist

**Solution**:
1. Check endpoint path spelling
2. Verify resource ID exists (try searching first)
3. Check API documentation

### Error: 422 Validation Error

**Cause**: Invalid request data format

**Solution**:
1. Check required fields are provided
2. Verify date formats (YYYY-MM-DD)
3. Ensure numeric IDs are not strings

### Error: 500 Internal Server Error

**Cause**: Server-side error

**Solution**:
1. Check data quality logs: `GET /api/quality/logs`
2. Verify database connectivity: `GET /health`
3. Contact API administrator

---

## API Response Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Check request parameters |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Fix request data format |
| 500 | Server Error | Check logs or contact admin |

---

## Additional Resources

- **API Base URL**: https://trend-data-api.onrender.com
- **Collection File**: `Trend_Data_Platform_API.postman_collection.json`
- **Database**: PostgreSQL on Render
- **Support**: Contact platform administrator

---

## Changelog

### Version 1.0.0 (2025-10-03)
- Initial Postman collection release
- 25+ endpoints across 6 categories
- Demographic data support
- Aggregation and time-series queries
