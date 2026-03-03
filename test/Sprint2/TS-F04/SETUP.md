# Test Setup Guide for TS-F04

## Step 1: Install Python Dependencies

### Option A: Using pip
```bash
# Navigate to the test directory
cd test/TS-F04

# Install all requirements
pip install -r requirements.txt
```

### Option B: Install individually
```bash
pip install robotframework==7.0.1
pip install robotframework-seleniumlibrary==6.1.3
```

## Step 2: Install WebDriver

### Option A: Automatic WebDriver Management (Recommended)
The test suite can use webdriver-manager for automatic ChromeDriver management:

```bash
pip install webdriver-manager
```

Then in your test setup, ChromeDriver will be automatically downloaded and managed.

### Option B: Manual ChromeDriver Setup

1. **Download ChromeDriver**
   - Visit: https://chromedriver.chromium.org/downloads
   - Download the version matching your Chrome browser version
   - To find your Chrome version: `chrome://version/`

2. **Place ChromeDriver in System PATH**
   
   **Windows:**
   - Extract chromedriver.exe
   - Copy to a directory in your PATH (e.g., `C:\Windows\System32`)
   - Or add the directory containing chromedriver to your PATH

   **Linux/Mac:**
   ```bash
   # Extract the file
   chmod +x chromedriver
   
   # Move to system path
   sudo mv chromedriver /usr/local/bin/
   ```

3. **Verify Installation**
   ```bash
   chromedriver --version
   ```

## Step 3: Environment Setup

### Create `.env` file (Optional)
Create a `.env` file in the TS-F04 directory for test environment variables:

```env
BASE_URL=http://localhost:3000
ADMIN_USERNAME=admin123
ADMIN_PASSWORD=123456789
BROWSER=chrome
WAIT_TIME=10s
```

### Configure Test Settings
Edit `robot.cfg` to customize test execution settings.

## Step 4: Verify Application Setup

### Start Frontend
```bash
cd code/frontend
npm install
npm run dev
```

The frontend should be accessible at `http://localhost:3000`

### Verify Admin Account
Ensure the following admin account exists in the database:
- Username: `admin123`
- Password: `123456789` (should be hashed in database)
- Role: `ADMIN`

## Step 5: Run Tests

### Run all tests
```bash
robot test_admin_log_viewing.robot
```

### Run with video recording (optional)
```bash
robot --loglevel DEBUG test_admin_log_viewing.robot
```

### View Results
After running tests:
- Report: `results/report.html`
- Log: `results/log.html`

## Troubleshooting

### Issue: "ChromeDriver not found"
**Solution:**
```bash
# Windows: Download and add to PATH
# Or use webdriver-manager:
pip install webdriver-manager
```

### Issue: "Connection refused" when accessing localhost:3000
**Solution:**
```bash
# Ensure frontend is running
cd code/frontend
npm run dev
```

### Issue: "Browser window not opening"
**Solution:**
```bash
# Try with Firefox instead
robot --variable BROWSER:firefox test_admin_log_viewing.robot
```

### Issue: "Admin login fails"
**Solution:**
1. Verify admin account exists in database
2. Check password is correct
3. Verify ADMIN role is assigned
4. Check database connection is working

### Issue: "Element not found" errors
**Solution:**
1. Verify page/application loaded correctly
2. Check if UI has changed (update selectors)
3. Increase WAIT_TIME variable
4. Check browser console for JavaScript errors

## Optional: Parallel Test Execution

To run tests in parallel using pabot:

```bash
pip install robotframework-pabot

# Run with 4 processes
pabot --processes 4 test_admin_log_viewing.robot
```

## Optional: Jenkins Integration

For CI/CD pipelines, create a Jenkinsfile or similar:

```groovy
pipeline {
    agent any
    stages {
        stage('Setup') {
            steps {
                sh 'pip install -r test/TS-F04/requirements.txt'
            }
        }
        stage('Test') {
            steps {
                sh 'robot -d results test/TS-F04/test_admin_log_viewing.robot'
            }
        }
        stage('Report') {
            steps {
                publishHTML([...])
            }
        }
    }
}
```

## Verification Checklist

- [ ] Python 3.7+ installed
- [ ] Robot Framework installed
- [ ] SeleniumLibrary installed  
- [ ] ChromeDriver available
- [ ] Application running on localhost:3000
- [ ] Admin account exists and accessible
- [ ] Test data exists in database
- [ ] Can manually login to application
- [ ] Browser opens and closes in test runs
- [ ] Test results generate HTML reports

## Quick Start (TL;DR)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Ensure app is running
cd ../../code/frontend && npm run dev &

# 3. Run tests
cd ../../test/TS-F04
robot test_admin_log_viewing.robot

# 4. View results
open results/report.html  # macOS
start results/report.html # Windows
```

---
For additional help, refer to README.md
