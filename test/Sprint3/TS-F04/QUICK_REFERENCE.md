# Quick Reference Guide - TS-F04 Test Suite

## Purpose
Test the admin log viewing functionality with filtering and export capabilities.

## Test Coverage

| Test Case | User Story | Description |
|-----------|-----------|-------------|
| TC01 | US1 | Admin login validation |
| TC02 | US1 | View logs page display |
| TC03 | US2 | Filter by existing username |
| TC04 | US3 | Filter by non-existing username |
| TC05 | US4 | Filter by existing IP address |
| TC06 | US5 | Filter by non-existing IP address |
| TC07 | US6 | Filter by SUCCESS result |
| TC08 | US7 | Filter by DENIED result |
| TC09 | US8 | Filter by ERROR result |
| TC10 | US9 | Filter by Authentication action |
| TC11 | US10 | Filter by User Management action |
| TC12 | US11 | Filter by Vehicle Management action |
| TC13 | US12 | Filter by Booking action |
| TC14 | US13 | Filter by Review action |
| TC15 | US14 | Filter by Driver Verification action |
| TC16 | US15 | Filter by Route action |
| TC17 | US16 | Filter by Admin Actions |
| TC18 | US17 | Filter by System action |
| TC19 | US18 | Export as CSV format |
| TC20 | US19 | Export as JSON format |

## Quick Commands

### Install & Run
```bash
# One-time setup
pip install -r requirements.txt

# Run all tests
robot test_admin_log_viewing.robot

# Run single test
robot -t "TS-F04-TC02" test_admin_log_viewing.robot

# Run by category
robot -i filter test_admin_log_viewing.robot  # Filters only
robot -i export test_admin_log_viewing.robot  # Export only
robot -i critical test_admin_log_viewing.robot  # Critical only
```

### View Results
```bash
# Open HTML report
# Windows: start results/report.html
# Mac: open results/report.html
# Linux: xdg-open results/report.html
```

## Common Selectors

```
Username Filter:     ${FILTER_USERNAME}
IP Address Filter:   ${FILTER_IP_ADDRESS}
Result Status:       ${SELECT_RESULT}
Action Category:     ${BTN_ACTION_FILTER}
Search Button:       ${BTN_SEARCH}
Clear Button:        ${BTN_CLEAR}
Export Button:       ${BTN_EXPORT}
Logs Table:          ${TABLE_LOGS}
```

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| BASE_URL | http://localhost:3000 | Application URL |
| ADMIN_USERNAME | admin123 | Login username |
| ADMIN_PASSWORD | 123456789 | Login password |
| BROWSER | chrome | Browser type |
| WAIT_TIME | 10s | Element wait timeout |

## Keyword Examples

```robot
# Clear all filters
Clear Filters

# Wait for logs to load
Wait For Logs To Load

# Get logs count
${count}=    Get Logs Count

# Get IP from first log
${ip}=    Get IP Address From First Log

# Apply filters
Apply Username Filter    admin123
Apply IP Address Filter    192.168.1.1
Apply Result Status Filter    SUCCESS
Apply Action Category Filter    Authentication    User Management

# Export
Export Logs As Format    csv
Export Logs As Format    json

# Verify
Verify Log Table Has Data
Verify Log Table Is Empty
Verify Filter Results Match Criteria    username    admin123
```

## Running Tests in Different Scenarios

### Development/Local Testing
```bash
robot -v BROWSER:chrome test_admin_log_viewing.robot
```

### CI/CD Pipeline
```bash
robot \
  --variable BASE_URL:${TEST_SERVER_URL} \
  --variable ADMIN_USERNAME:${TEST_ADMIN_USER} \
  --variable ADMIN_PASSWORD:${TEST_ADMIN_PASS} \
  -d results \
  test_admin_log_viewing.robot
```

### Headless Mode (No Browser Window)
```bash
robot \
  --variable BROWSER:headlesschrome \
  test_admin_log_viewing.robot
```

### With Debug Output
```bash
robot -d results --loglevel DEBUG test_admin_log_viewing.robot
```

## Expected Outcomes

✓ All 20 test cases pass  
✓ Filters work correctly  
✓ Export generates valid files  
✓ No data corruption  
✓ Performance acceptable  

## Test Data Requirements

Before running tests, ensure:
- Admin account exists (admin123)
- Multiple logs in database
- Logs with different statuses (SUCCESS, DENIED, ERROR)
- Logs from different IP addresses
- Logs with various action categories

## Troubleshooting Quick Tips

| Problem | Solution |
|---------|----------|
| Tests time out | Increase WAIT_TIME |
| Login fails | Verify admin credentials in DB |
| Can't find elements | Check if app is running on localhost:3000 |
| Browser won't open | Verify ChromeDriver version matches Chrome |
| Screenshot fails | Ensure results/ directory exists |

## File Structure

```
TS-F04/
├── test_admin_log_viewing.robot      # Main test file
├── keywords/
│   ├── common_keywords.robot         # Common test keywords
│   └── admin_log_keywords.robot      # Admin log specific keywords
├── data/
│   └── test_data.json               # Test data (optional)
├── robot.cfg                        # Robot Framework config
├── requirements.txt                 # Python dependencies
├── README.md                        # Full documentation
├── SETUP.md                         # Setup guide
├── QUICK_REFERENCE.md              # This file
└── results/                         # Test results (generated)
    ├── report.html
    ├── log.html
    └── screenshot_*.png
```

## Performance Benchmarks

Expected test execution times:
- TC01 (Login): ~5 seconds
- TC02 (View logs): ~3 seconds
- Filter tests (each): ~4-6 seconds
- Export tests (each): ~5-8 seconds
- **Total suite**: ~90-120 seconds

## Maintenance

### Weekly
- Review test failures
- Update selectors if UI changed
- Check test data exists

### Monthly
- Review and update documentation
- Archive old test reports
- Optimize slow tests

### Quarterly
- Update dependencies
- Review test coverage
- Plan new test cases

## Support & Issues

For issues, check:
1. Browser/driver version match
2. Application is running
3. Database has test data
4. Admin account exists
5. Network connection

## Related Documentation
- [README.md](./README.md) - Full test documentation
- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [Robot Framework Docs](https://robotframework.org/)

---
**Last Updated**: 2026-03-03  
**Version**: 1.0  
**Maintainer**: QA Team
