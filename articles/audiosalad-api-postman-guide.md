# AudioSalad API Postman Collection - Usage Guide

## Table of Contents

1. [Overview](#overview)
2. [Initial Setup](#initial-setup)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Common Workflows](#common-workflows)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview

The AudioSalad Client API provides programmatic access to manage music catalog data, including labels, releases, tracks, artists, and content delivery to digital service providers (DSPs). This Postman collection offers a complete, pre-configured interface to all available endpoints.

### Key Capabilities

- **Catalog Management**: Query and update labels, releases, tracks, and artists
- **Media Access**: Retrieve audio files and cover art
- **Content Ingestion**: Import content from AWS S3 buckets
- **Delivery Management**: Schedule and monitor content delivery to DSPs

### Rate Limiting

- Default limit: 75 requests per minute
- HTTP 429 response when exceeded
- `Retry-After` header indicates when to retry

---

## Initial Setup

### 1. Prerequisites

Before using the API, you need:

- API account credentials (contact <support@audiosalad.com>)
- Access to the AudioSalad Dashboard
- Postman installed on your machine

### 2. Import the Collection

1. Open Postman
2. Click "Import" → Select the collection JSON file
3. The collection will appear in your workspace

### 3. Configure Environment Variables

Navigate to the collection variables tab and configure:

| Variable        | Description                        | How to Obtain                                        |
| --------------- | ---------------------------------- | ---------------------------------------------------- |
| `api_url`       | Base API URL                       | Default: `https://dashboard.precise.digital`         |
| `access_id`     | Your unique access identifier      | Provided: `6787c16e0907b83a03c70062bc9f072ee92fabe8` |
| `refresh_token` | Token for requesting access tokens | Generate in Dashboard → /tokens                      |
| `client_id`     | Your client identifier             | Replace `{client-id}` with your actual ID            |
| `access_token`  | Bearer token for API requests      | Auto-populated after authentication                  |

### 4. Generate Refresh Token

1. Log into the Dashboard with your API credentials
2. Navigate to `/tokens`
3. Click "Generate New Refresh Token"
4. Copy the token and save it in Postman variables
5. Note: Refresh tokens are valid for 24 hours

---

## Authentication

### Token Lifecycle

- **Access Tokens**: Valid for 1 hour
- **Refresh Tokens**: Valid for 24 hours
- New refresh token provided with each access token request

### Authentication Flow

#### Step 1: Get Access Token

```http
POST /client-api/access-token
Headers:
  X-Access-ID: {{access_id}}
Body:
  {
    "refresh_token": "{{refresh_token}}"
  }
```

**Automatic Token Management**: The collection automatically saves the access token after successful authentication.

#### Step 2: Verify Authentication

```http
GET /client-api/authenticated-resource
Headers:
  X-Access-ID: {{access_id}}
  Authorization: Bearer {{access_token}}
```

Response: `{"success": true}`

### Token Expiration Handling

- Monitor token expiration times in responses
- Request new access token before expiration
- If refresh token expires, generate new one in Dashboard

---

## API Endpoints

### Labels

#### Get Label Information

Query labels by ID, name, or retrieve all labels:

```http
GET /client-api/label?label_id=67
GET /client-api/label?label_name=AudioSalad Records
GET /client-api/label  # Returns all labels
```

**Response Fields:**

- `id`: Unique label identifier
- `name`: Internal label name
- `display_name`: Public-facing name
- `parent_label_id`: Parent label reference
- `dsp_ids`: DSP-specific identifiers

### Releases

#### Query Methods

Releases can be retrieved using multiple identifiers:

1. **By Release ID**: `/client-api/release?release_id=632`
2. **By UPC**: `/client-api/release?upc=196429078383`
3. **By Catalog**: `/client-api/release?catalog=ASD0001`
4. **By Custom ID**: `/client-api/release?custom_id=AS-CUSTOMID`

#### Get Modified Releases

Track releases modified within a date range:

```http
GET /client-api/release-ids?modified_start=2024-08-15T13:29:02Z&modified_end=2024-10-15T13:29:02Z
```

#### Release List with Metadata

```http
POST /client-api/release-list
Body:
  {
    "modified_start": "2024-08-15T13:29:02Z",
    "modified_end": "2024-10-15T13:29:02Z",
    "upcs": ["192641099700", "196429078383"]  # Optional
  }
```

### Tracks

#### Query Methods

Similar to releases, tracks support multiple query methods:

1. **By Track ID**: `/client-api/track?track_id=3980`
2. **By ISRC**: `/client-api/track?isrc=QZAKB1810032`
3. **By Custom ID**: `/client-api/track?custom_id=AS-TRACKCUSTOMID`

#### Track Response Includes

- Basic metadata (title, artist, ISRC)
- Duration and disc/track numbers
- Copyright information (P-line, C-line)
- Participants with roles
- Audio URLs for different qualities
- Associated release information

### Artists

#### Get Artist Information

```http
GET /client-api/artist/2538
```

#### Update Artist

Modify name and/or DSP identifiers:

```http
POST /client-api/artist/2538
Body:
  {
    "name": "Artist Name",
    "dsp_ids": {
      "spotify": "spotify:artist:2lvPwN75VoOSDqQxeoyq",
      "itunes": "1445049162"
    }
  }
```

**Tips:**

- Omit DSP from `dsp_ids` to remove it
- Include only `name` to update name without affecting DSP IDs

### Media Files

#### Audio Retrieval

Three quality options available:

```http
GET /client-api/audio?track_id=3980&type=clip      # Short preview
GET /client-api/audio?track_id=3980&type=mp3-320   # High quality (320kbps)
GET /client-api/audio?track_id=3980&type=mp3-96    # Low quality (96kbps)
```

#### Image Retrieval

Seven size options (in pixels):

```http
GET /client-api/image?image_id=737&size=xxsmall  # 90px
GET /client-api/image?image_id=737&size=xsmall   # 125px
GET /client-api/image?image_id=737&size=small    # 175px
GET /client-api/image?image_id=737&size=medium   # 300px
GET /client-api/image?image_id=737&size=large    # 640px
GET /client-api/image?image_id=737&size=xlarge   # 1024px
GET /client-api/image?image_id=737&size=xxlarge  # 2048px
```

### Content Ingestion

#### Workflow Overview

1. **Scan** S3 bucket for available files
2. **Run** ingestion to import content
3. **Monitor** status until completion

#### Step 1: Scan for Files

```http
POST /client-api/ingest/scan
Body:
  {
    "s3_bucket": "example-bucket.s3.us-east-1.amazonaws.com",
    "s3_id": "AKIAEXAMPLE1234567890",
    "s3_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "s3_path": "example-folder"  # Optional
  }
```

Response shows file counts:

```json
{
  "mp3_ready": 6,
  "wav_ready": 6,
  "flac_ready": 4,
  "xml_ready": 6,
  "video_ready": 1
}
```

#### Step 2: Run Ingestion

```http
POST /client-api/ingest/run
Body:
  {
    "label_id": "32",
    "read_only": true,  # Optional: preserves S3 files
    "s3_bucket": "example-bucket.s3.us-east-1.amazonaws.com",
    "s3_id": "AKIAEXAMPLE1234567890",
    "s3_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "s3_path": "example-folder"
  }
```

**Note**: The collection automatically saves the `ingest_id` for status tracking.

#### Step 3: Check Status

```http
GET /client-api/ingest/status?ingest_id={{ingest_id}}
```

Status States:

- `queued`: Waiting to start
- `active`: In progress (check `progress` percentage)
- `completed`: Finished (check `success_count` and `failure_count`)
- `error`: Failed entirely

### Delivery Management

#### Schedule Delivery

```http
POST /client-api/delivery
Body:
  {
    "release_ids": ["505"],
    "target_ids": ["10"],
    "run_date": "2024-12-15T13:00:00Z",
    "action": "add"  # Options: clear, add, full-update, meta-update, delete
  }
```

#### List Available Targets

```http
GET /client-api/delivery-targets
```

Common targets include:

- Spotify (ID: 10)
- Amazon (ID: 67)
- Apple/iTunes (ID: 72)
- YouTube (ID: 122)
- TIDAL (ID: 45)

#### Check Delivery Status

Filter by releases, targets, or both:

```http
POST /client-api/delivery-status
Body (examples):
  {"release_ids": ["505"]}                    # By release
  {"target_ids": ["67", "10"]}                # By targets
  {"release_ids": ["505"], "target_ids": ["67"]}  # Combined
```

---

## Common Workflows

### Workflow 1: Import and Deliver New Release

1. **Prepare S3 Bucket** with audio files and metadata
2. **Scan for Files**:

   ```http
   POST /client-api/ingest/scan
   ```

3. **Run Ingestion**:

   ```http
   POST /client-api/ingest/run
   ```

4. **Monitor Status** until completed:

   ```http
   GET /client-api/ingest/status?ingest_id={{ingest_id}}
   ```

5. **Verify Release** imported correctly:

   ```http
   GET /client-api/release?upc=YOUR_UPC
   ```

6. **Schedule Delivery** to DSPs:

   ```http
   POST /client-api/delivery
   ```

7. **Track Delivery Status**:

   ```http
   POST /client-api/delivery-status
   ```

### Workflow 2: Update Artist Information

1. **Get Current Information**:

   ```http
   GET /client-api/artist/ARTIST_ID
   ```

2. **Update DSP IDs**:

   ```http
   POST /client-api/artist/ARTIST_ID
   Body: {
     "name": "Artist Name",
     "dsp_ids": {
       "spotify": "spotify:artist:ID",
       "itunes": "ID"
     }
   }
   ```

### Workflow 3: Bulk Release Status Check

1. **Get Modified Release IDs**:

   ```http
   GET /client-api/release-ids?modified_start=DATE&modified_end=DATE
   ```

2. **Get Detailed Information**:

   ```http
   POST /client-api/release-list
   Body: {
     "modified_start": "DATE",
     "modified_end": "DATE"
   }
   ```

---

## Troubleshooting

### Common Issues and Solutions

#### 401 Unauthorized

- **Cause**: Invalid or expired access token
- **Solution**: Request new access token using refresh token

#### 403 Forbidden (S3 Operations)

- **Cause**: Invalid AWS credentials or insufficient permissions
- **Solution**: Verify S3 credentials and bucket permissions

#### 429 Too Many Requests

- **Cause**: Rate limit exceeded (75 requests/minute)
- **Solution**: Check `Retry-After` header and wait before retrying

#### Empty Ingestion Results

- **Cause**: No files at specified S3 location
- **Solution**: Verify S3 path and file presence

#### Invalid Refresh Token

- **Cause**: Refresh token expired (24 hours) or invalidated
- **Solution**: Generate new refresh token in Dashboard

### Error Response Format

```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "code": 400
}
```

---

## Best Practices

### Security

1. **Never share** access tokens or refresh tokens
2. **Rotate tokens** regularly
3. **Store credentials** securely (use Postman environments)
4. **Monitor** for unusual API activity

### Performance

1. **Batch operations** when possible
2. **Cache responses** for stable data (labels, artists)
3. **Use appropriate image sizes** to reduce bandwidth
4. **Implement retry logic** with exponential backoff

### Data Management

1. **Use custom IDs** for internal reference tracking
2. **Maintain mapping** between your system and AudioSalad IDs
3. **Regular backups** of catalog metadata
4. **Validate data** before ingestion to avoid failures

### Ingestion Best Practices

1. **Validate metadata** XML against schema before upload
2. **Use read_only mode** for initial testing
3. **Process smaller batches** to identify issues early
4. **Monitor ingestion logs** in the summary field
5. **Maintain consistent** file naming conventions

### Delivery Management

1. **Schedule deliveries** during off-peak hours
2. **Verify release state** (must be ready/published/archived)
3. **Check target compatibility** before scheduling
4. **Monitor delivery errors** and retry failed deliveries
5. **Keep delivery history** for audit purposes

---

## Additional Resources

- **API Documentation**: <https://dashboard.precise.digital/api-docs>
- **Support Email**: <support@audiosalad.com>
- **Dashboard Access**: <https://dashboard.precise.digital>
- **Token Management**: Dashboard → /tokens

---

## Quick Reference

### Required Headers (All Requests)

```http
X-Access-ID: {{access_id}}
Authorization: Bearer {{access_token}}
```

### Date Format

All dates use ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`

### Common HTTP Status Codes

- `200`: Success
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource doesn't exist
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error
