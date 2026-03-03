# CI/CD Integration Examples for TS-F04

## GitHub Actions Workflow

Create `.github/workflows/test-ts-f04.yml`:

```yaml
name: TS-F04 Admin Log Viewing Tests

on:
  push:
    branches: [ develop, main, master ]
    paths:
      - 'code/frontend/pages/admin/log/**'
      - 'code/backend/src/**'
      - 'test/TS-F04/**'
  pull_request:
    branches: [ develop, main ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      # Database service
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: test_db
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
          cache: 'pip'

      - name: Install Python dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r test/TS-F04/requirements.txt

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: code/frontend/package-lock.json

      - name: Install frontend dependencies
        run: |
          cd code/frontend
          npm ci

      - name: Install backend dependencies
        run: |
          cd code/backend
          npm ci

      - name: Setup test database
        run: |
          mysql -h 127.0.0.1 -u root -proot test_db < test/TS-F04/TEST_DATA.md
          # Or run database initialization script:
          node code/backend/scripts/seed-test-db.js

      - name: Start backend server
        run: |
          cd code/backend
          npm start &
          sleep 10
        timeout-minutes: 5

      - name: Start frontend development server
        run: |
          cd code/frontend
          npm run dev > /tmp/frontend.log 2>&1 &
          sleep 15
          curl -f http://localhost:3000 || (cat /tmp/frontend.log && exit 1)
        timeout-minutes: 5

      - name: Run TS-F04 tests
        run: |
          cd test/TS-F04
          robot \
            --outputdir results \
            --variable BASE_URL:http://localhost:3000 \
            --variable ADMIN_USERNAME:admin123 \
            --variable ADMIN_PASSWORD:123456789 \
            --loglevel INFO \
            test_admin_log_viewing.robot
        timeout-minutes: 30
        continue-on-error: true

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: robot-framework-reports
          path: test/TS-F04/results/
          retention-days: 30

      - name: Publish test report
        if: always()
        uses: dorny/test-reporter@v1
        with:
          name: Robot Framework Results
          path: test/TS-F04/results/output.xml
          reporter: 'java-junit'

      - name: Comment PR with test results
        if: github.event_name == 'pull_request' && always()
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('test/TS-F04/results/report.html', 'utf8');
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '✅ Robot Framework tests completed. See artifacts for detailed report.'
            });

      - name: Notify Slack on failure
        if: failure()
        uses: slackapi/slack-github-action@v1
        with:
          webhook-url: ${{ secrets.SLACK_WEBHOOK }}
          payload: |
            {
              "text": "TS-F04 tests failed",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "❌ *TS-F04 Admin Log Tests Failed*\n*Repository:* ${{ github.repository }}\n*Branch:* ${{ github.ref }}\n*Commit:* ${{ github.sha }}"
                  }
                }
              ]
            }
```

## GitLab CI Configuration

Create `.gitlab-ci.yml` in root:

```yaml
stages:
  - setup
  - build
  - test
  - report

variables:
  BASE_URL: "http://localhost:3000"
  ADMIN_USERNAME: "admin123"
  ADMIN_PASSWORD: "123456789"

test:ts-f04:
  stage: test
  image: python:3.9
  
  services:
    - mysql:8.0
    - name: node:18
  
  before_script:
    - apt-get update && apt-get install -y chromium-browser
    - pip install -r test/TS-F04/requirements.txt
    - npm install --prefix code/frontend
    - npm install --prefix code/backend
  
  script:
    # Setup database
    - mysql -h mysql -u root -p$MYSQL_ROOT_PASSWORD < test/TS-F04/TEST_DATA.md
    
    # Start services
    - cd code/backend && npm start &
    - cd ../frontend && npm run dev &
    - sleep 20
    
    # Run tests
    - cd ../../test/TS-F04
    - robot -d results test_admin_log_viewing.robot
  
  artifacts:
    when: always
    paths:
      - test/TS-F04/results/
    reports:
      junit: test/TS-F04/results/output.xml
  
  retry:
    max: 2
    when: script_failure
```

## Jenkins Pipeline

Create `Jenkinsfile` in root:

```groovy
pipeline {
    agent any
    
    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }
    
    environment {
        BASE_URL = 'http://localhost:3000'
        ADMIN_USERNAME = 'admin123'
        ADMIN_PASSWORD = '123456789'
        ROBOT_RESULTS = 'test/TS-F04/results'
    }
    
    stages {
        stage('Setup') {
            steps {
                script {
                    sh '''
                        python -m pip install -r test/TS-F04/requirements.txt
                        npm ci --prefix code/frontend
                        npm ci --prefix code/backend
                    '''
                }
            }
        }
        
        stage('Start Services') {
            steps {
                script {
                    sh '''
                        cd code/backend && npm start > /tmp/backend.log 2>&1 &
                        cd ../frontend && npm run dev > /tmp/frontend.log 2>&1 &
                        sleep 20
                        curl -f http://localhost:3000 || exit 1
                    '''
                }
            }
        }
        
        stage('Setup Database') {
            steps {
                script {
                    sh '''
                        # Run test data setup
                        mysql -h localhost -u root -proot < test/TS-F04/TEST_DATA.md
                    '''
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    sh '''
                        cd test/TS-F04
                        robot \
                            -d ${ROBOT_RESULTS} \
                            -v BASE_URL:${BASE_URL} \
                            -v ADMIN_USERNAME:${ADMIN_USERNAME} \
                            -v ADMIN_PASSWORD:${ADMIN_PASSWORD} \
                            --loglevel INFO \
                            test_admin_log_viewing.robot
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Publish robot framework reports
            robot outputPath: "${ROBOT_RESULTS}", 
                   logFileName: "log.html",
                   reportFileName: "report.html"
            
            // Archive results
            archiveArtifacts artifacts: "${ROBOT_RESULTS}/**", 
                             allowEmptyArchive: true
            
            // Cleanup
            sh '''
                pkill -f "npm start" || true
                pkill -f "npm run dev" || true
            '''
        }
        
        success {
            echo "✅ TS-F04 tests passed successfully!"
        }
        
        failure {
            echo "❌ TS-F04 tests failed!"
            // Send notifications
            emailext(
                subject: "TS-F04 Test Failure - ${env.JOB_NAME}",
                body: "Build: ${env.BUILD_URL}",
                to: "${env.TEST_NOTIFICATIONS_EMAIL}"
            )
        }
    }
}
```

## Azure Pipelines

Create `azure-pipelines.yml`:

```yaml
trigger:
  - develop
  - main

pr:
  - develop
  - main

pool:
  vmImage: 'ubuntu-latest'

variables:
  BASE_URL: 'http://localhost:3000'
  ADMIN_USERNAME: 'admin123'
  ADMIN_PASSWORD: '123456789'

stages:
  - stage: Test
    jobs:
      - job: RobotFrameworkTests
        steps:
          - task: UsePythonVersion@0
            inputs:
              versionSpec: '3.9'
            displayName: 'Use Python 3.9'

          - task: UseNode@1
            inputs:
              version: '18.x'
            displayName: 'Use Node 18'

          - script: |
              python -m pip install --upgrade pip
              pip install -r test/TS-F04/requirements.txt
            displayName: 'Install Python dependencies'

          - script: |
              npm ci --prefix code/frontend
              npm ci --prefix code/backend
            displayName: 'Install Node dependencies'

          - script: |
              cd code/backend && npm start > /tmp/backend.log 2>&1 &
              cd ../frontend && npm run dev > /tmp/frontend.log 2>&1 &
              sleep 20
            displayName: 'Start services'

          - script: |
              cd test/TS-F04
              robot -d results test_admin_log_viewing.robot
            displayName: 'Run TS-F04 tests'
            continueOnError: true

          - task: PublishTestResults@2
            condition: always()
            inputs:
              testResultsFormat: 'JUnit'
              testResultsFiles: 'test/TS-F04/results/output.xml'
              testRunTitle: 'TS-F04 Test Results'

          - task: PublishBuildArtifacts@1
            condition: always()
            inputs:
              pathToPublish: 'test/TS-F04/results'
              artifactName: 'robot-reports'

          - script: pkill -f "npm start" || true
            condition: always()
            displayName: 'Cleanup'
```

## Docker-based Testing

Create `Dockerfile.test`:

```dockerfile
FROM python:3.9-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    chromium-browser \
    chromium-driver \
    curl \
    git \
    mysql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy files
COPY . .

# Install Python dependencies
RUN pip install -r test/TS-F04/requirements.txt

# Install Node dependencies
RUN npm ci --prefix code/frontend && \
    npm ci --prefix code/backend

# Run tests
CMD ["bash", "-c", "cd test/TS-F04 && robot test_admin_log_viewing.robot"]
```

Run with Docker:

```bash
docker build -f Dockerfile.test -t ts-f04-tests .
docker run --rm ts-f04-tests
```

---

Choose the CI/CD platform that matches your project setup!
