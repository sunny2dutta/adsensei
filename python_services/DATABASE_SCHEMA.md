# Database Schema Documentation

## ⚠️ IMPORTANT: Log Cleanup Policy

**ONLY the following tables are cleaned up after 15 days:**

### LOG TABLES (Auto-deleted after 15 days)
These tables contain **temporary operational logs** and are automatically cleaned:

1. **`request_logs`** - API request logs
   - Request/response data, timing, success/failure
   - IP addresses, user agents, endpoints hit
   - Product details from requests (for debugging)

2. **`error_logs`** - Error and exception logs  
   - Error messages, stack traces, context
   - Request IDs for tracing errors back to requests

3. **`performance_logs`** - System performance logs
   - Operation timings, memory usage, CPU metrics
   - Performance monitoring data

### PERSISTENT DATA TABLES (Never auto-deleted)
These tables contain **business-critical data** that is NEVER automatically cleaned:

- **User accounts, authentication, passwords**
- **Ad performance metrics and analytics** 
- **Generated images and their metadata**
- **User preferences and settings**
- **Campaign data and results**
- **Billing and subscription information**
- **Any other persistent application data**

## Safety Mechanisms

1. **Table Name Validation**: Cleanup only targets tables ending with `_logs`
2. **Explicit Whitelist**: Only the 3 log tables above are in the cleanup list
3. **Multiple Safety Checks**: Code validates table names before deletion
4. **Detailed Logging**: All cleanup operations are logged with breakdowns
5. **Manual Override**: Cleanup can be triggered manually for testing

## Log Data Retention

- **Retention Period**: 15 days
- **Cleanup Schedule**: 
  - Daily at 2:00 AM (automatic)
  - Weekly at Sunday 3:00 AM (comprehensive with stats)
- **Manual Cleanup**: Available via `POST /logs/cleanup` endpoint

## Current Database Structure

```
logs.db (SQLite)
├── request_logs     (LOG - auto-deleted after 15 days)
├── error_logs       (LOG - auto-deleted after 15 days)  
├── performance_logs (LOG - auto-deleted after 15 days)
└── [future tables]  (PERSISTENT - never auto-deleted unless explicitly configured)
```

## Adding New Tables

When adding new tables to the database:

1. **For LOG tables**: Name them with `_logs` suffix and they'll be auto-cleaned
2. **For DATA tables**: Use any other naming convention and they'll be preserved permanently
3. **Update this documentation** when adding new table types

## Monitoring

- Check cleanup stats: `GET /logs/stats`
- Manual cleanup: `POST /logs/cleanup` 
- View service status: `GET /health`
- All cleanup operations are logged for audit purposes