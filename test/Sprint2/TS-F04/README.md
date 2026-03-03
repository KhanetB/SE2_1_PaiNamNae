# TS-F04: Admin Log Viewing Test Suite

## Overview
This test suite validates the admin log viewing functionality (TS-F04) of the PaiNamNae application. It covers all user stories from US1 to US19, including login, log viewing, filtering, and export functionality.

## Test Scenario Details
- **Test Scenario ID**: TS-F04
- **Test Scenario Name**: Admin ต้องการดู log ของผู้ใช้งาน (Admin wants to view user logs)
- **Project ID**: P01

## Prerequisites
1. **Robot Framework** installed
   ```bash
   pip install robotframework
   ```

2. **SeleniumLibrary** installed
   ```bash
   pip install robotframework-seleniumlibrary
   ```

3. **Chrome WebDriver** (ChromeDriver)
   - Download from: https://chromedriver.chromium.org/
   - Ensure it's in your PATH or specify its location

4. **Application Running**
   - Frontend: Running on `http://localhost:3000`
   - Backend: Running and accessible
   - Database: Populated with test data

5. **Admin Account Ready**
   - Username: `admin123`
   - Password: `123456789`

## Test Data Preparation
Before running tests, ensure the following test data exists:
- Multiple log entries with different usernames
- Logs with various IP addresses
- Logs with SUCCESS, DENIED, and ERROR statuses
- Logs with different action categories
- Test user accounts for filtering tests

## Test Cases

### Login Tests
- **TC01**: Admin Login Successfully
  - Validates login with correct credentials
  - Verifies redirect to admin dashboard

### Log Viewing Tests
- **TC02**: View Admin Log Page And Display All Logs
  - Navigates to log page
  - Verifies UI elements are displayed
  - Confirms logs are loaded

### Username Filter Tests
- **TC03**: Filter By Existing Username
  - Filters logs by username that exists
  - Verifies results are displayed

- **TC04**: Filter By Non-Existing Username
  - Filters logs by non-existing username
  - Verifies "No data" message is shown

### IP Address Filter Tests
- **TC05**: Filter By Existing IP Address
  - Filters logs by IP address that exists
  - Verifies results are displayed

- **TC06**: Filter By Non-Existing IP Address
  - Filters logs by non-existing IP address
  - Verifies "No data" message is shown

### Result Status Filter Tests
- **TC07**: Filter By SUCCESS Result
  - Filters logs with SUCCESS status
  - Verifies results match criteria

- **TC08**: Filter By DENIED Result
  - Filters logs with DENIED status
  - Verifies results match criteria

- **TC09**: Filter By ERROR Result
  - Filters logs with ERROR status
  - Verifies results match criteria

### Action Category Filter Tests
- **TC10**: Filter By Authentication
- **TC11**: Filter By User Management
- **TC12**: Filter By Vehicle Management
- **TC13**: Filter By Booking
- **TC14**: Filter By Review
- **TC15**: Filter By Driver Verification
- **TC16**: Filter By Route
- **TC17**: Filter By Admin Actions
- **TC18**: Filter By System

### Export Tests
- **TC19**: Export Logs As CSV Format
  - Exports all logs as CSV file
  - Verifies export success

- **TC20**: Export Logs As JSON Format
  - Exports all logs as JSON file
  - Verifies export success

## Running the Tests

### Run All Tests
```bash
robot -d results test_admin_log_viewing.robot
```

### Run Specific Test
```bash
robot -d results -t "TS-F04-TC02" test_admin_log_viewing.robot
```

### Run Tests by Tag
```bash
# Run only login tests
robot -d results -i critical test_admin_log_viewing.robot

# Run only filter tests
robot -d results -i filter test_admin_log_viewing.robot

# Run only export tests
robot -d results -i export test_admin_log_viewing.robot
```

### Run with Different Browser
```bash
robot -d results --variable BROWSER:firefox test_admin_log_viewing.robot
```

## Configurable Variables
You can override these variables when running tests:

```bash
robot \
  --variable BASE_URL:http://localhost:3000 \
  --variable ADMIN_USERNAME:admin123 \
  --variable ADMIN_PASSWORD:123456789 \
  --variable BROWSER:chrome \
  -d results \
  test_admin_log_viewing.robot
```

## Expected Test Results

### Success Criteria
1. All login credentials are accepted
2. Log page loads with all UI elements
3. Filters apply correctly and show appropriate results
4. Non-matching filters show "No data" message
5. Each action category filter returns relevant logs
6. Export functions successfully in both CSV and JSON formats
7. No data loss during export

### Failure Scenarios
- Login fails with incorrect credentials
- Log page fails to load
- Filters don't work correctly
- Export fails or produces corrupted files
- UI elements missing or not clickable

## Test Artifacts
After running tests, results will be saved in the `results/` directory:
- `report.html` - Test report
- `log.html` - Detailed execution log
- Screenshots captured on failures

## Troubleshooting

### Common Issues

**Issue**: Tests fail because ChromeDriver is not found
```bash
# Solution: Download and add ChromeDriver to PATH or specify in test
```

**Issue**: Application is not running
```bash
# Solution: Ensure frontend is running on http://localhost:3000
npm run dev  # In frontend directory
```

**Issue**: Admin account doesn't have access to logs
```bash
# Solution: Verify admin user exists and has ADMIN role in database
```

**Issue**: Modal selectors not working
```bash
# Solution: Check browser driver version matches Chrome version
chromedriver --version
chrome --version
```

## Extending the Tests

To add new test cases:
1. Add new keyword in `keywords/admin_log_keywords.robot`
2. Create corresponding test case in `test_admin_log_viewing.robot`
3. Follow the same naming convention: `TS-F04-TCxx`
4. Add appropriate tags for categorization
5. Update this README with new test details

## Resources
- [Robot Framework Documentation](https://robotframework.org/)
- [SeleniumLibrary Documentation](https://robotframework.org/SeleniumLibrary/)
- [Robot Framework Best Practices](https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html)

## Test Maintenance
- Review and update selectors monthly
- Update test data as needed
- Keep documentation in sync with code changes
- Archive old test reports

## Contact & Support
For issues or questions regarding these tests, please contact the QA team.

---
Last Updated: 2026-03-03
Test Suite Version: 1.0
