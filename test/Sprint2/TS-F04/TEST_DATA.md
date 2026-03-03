# Test Data Requirements for TS-F04

## Database Setup Script

Before running tests, ensure the following data exists in the database:

### 1. Admin User (Required for Login)
```sql
-- Insert admin user
INSERT INTO User (
  username, 
  email, 
  password, 
  firstName, 
  lastName, 
  role, 
  createdAt
) VALUES (
  'admin123',
  'admin@test.com',
  '[BCRYPT_HASHED_PASSWORD_OF_123456789]',
  'Admin',
  'User',
  'ADMIN',
  NOW()
);
```

### 2. Test Users (For Log Filtering)
```sql
-- Insert multiple test users for filtering tests
INSERT INTO User (username, email, password, firstName, lastName, role, createdAt) 
VALUES 
  ('driver001', 'driver1@test.com', '[HASHED]', 'Driver', 'One', 'DRIVER', NOW()),
  ('passenger001', 'passenger1@test.com', '[HASHED]', 'Passenger', 'One', 'PASSENGER', NOW()),
  ('admin002', 'admin2@test.com', '[HASHED]', 'Admin', 'Two', 'ADMIN', NOW());
```

### 3. Sample Audit Logs (For Viewing and Filtering)

#### SUCCESS Logs
```sql
INSERT INTO AuditLog (
  userId, user_id, action, actionType, endpoint, httpMethod, httpStatusCode, 
  accessResult, ipAddress, userAgent, createdAt
) VALUES
  (1, 1, 'LOGIN_SUCCESS', 'Authentication', '/api/auth/login', 'POST', 200, 'SUCCESS', '192.168.1.100', 'Mozilla/5.0...', NOW()),
  (2, 2, 'USER_REGISTERED', 'User Management', '/api/users/register', 'POST', 201, 'SUCCESS', '192.168.1.101', 'Mozilla/5.0...', NOW()),
  (2, 2, 'PROFILE_UPDATED', 'User Management', '/api/users/profile', 'PUT', 200, 'SUCCESS', '192.168.1.101', 'Mozilla/5.0...', NOW()),
  (2, 2, 'VEHICLE_CREATED', 'Vehicle Management', '/api/vehicles', 'POST', 201, 'SUCCESS', '192.168.1.101', 'Mozilla/5.0...', NOW()),
  (2, 2, 'BOOKING_CREATED', 'Booking', '/api/bookings', 'POST', 201, 'SUCCESS', '192.168.1.102', 'Mozilla/5.0...', NOW()),
  (3, 3, 'ADMIN_VIEWED', 'Admin Actions', '/api/admin/logs', 'GET', 200, 'SUCCESS', '192.168.1.103', 'Mozilla/5.0...', NOW());
```

#### DENIED Logs
```sql
INSERT INTO AuditLog (
  userId, user_id, action, actionType, endpoint, httpMethod, httpStatusCode, 
  accessResult, ipAddress, userAgent, createdAt
) VALUES
  (NULL, NULL, 'LOGIN_FAILED', 'Authentication', '/api/auth/login', 'POST', 401, 'DENIED', '192.168.1.104', 'Mozilla/5.0...', NOW()),
  (1, 1, 'PROFILE_VIEWED', 'User Management', '/api/users/99999/profile', 'GET', 403, 'DENIED', '192.168.1.100', 'Mozilla/5.0...', NOW()),
  (2, 2, 'VEHICLE_DELETED', 'Vehicle Management', '/api/vehicles/99999', 'DELETE', 403, 'DENIED', '192.168.1.101', 'Mozilla/5.0...', NOW()),
  (3, 3, 'ROUTE_DELETE', 'Route', '/api/routes/99999', 'DELETE', 401, 'DENIED', '192.168.1.103', 'Mozilla/5.0...', NOW());
```

#### ERROR Logs
```sql
INSERT INTO AuditLog (
  userId, user_id, action, actionType, endpoint, httpMethod, httpStatusCode, 
  accessResult, ipAddress, userAgent, createdAt
) VALUES
  (2, 2, 'BOOKING_UPDATED', 'Booking', '/api/bookings/invalid', 'PUT', 400, 'ERROR', '192.168.1.102', 'Mozilla/5.0...', NOW()),
  (3, 3, 'DRIVER_VERIFICATION_SUBMITTED', 'Driver Verification', '/api/driver-verification', 'POST', 500, 'ERROR', '192.168.1.105', 'Mozilla/5.0...', NOW()),
  (2, 2, 'ROUTE_CREATED', 'Route', '/api/routes', 'POST', 500, 'ERROR', '192.168.1.101', 'Mozilla/5.0...', NOW()),
  (1, 1, 'REVIEW_CREATED', 'Review', '/api/reviews', 'POST', 400, 'ERROR', '192.168.1.100', 'Mozilla/5.0...', NOW());
```

#### More Action Category Logs
```sql
-- For comprehensive action category filtering
INSERT INTO AuditLog (
  userId, user_id, action, actionType, endpoint, httpMethod, httpStatusCode, 
  accessResult, ipAddress, userAgent, createdAt
) VALUES
  -- Review actions
  (2, 2, 'REVIEW_CREATED', 'Review', '/api/reviews', 'POST', 201, 'SUCCESS', '192.168.1.102', 'Mozilla/5.0...', NOW()),
  
  -- Route actions
  (2, 2, 'ROUTE_CREATED', 'Route', '/api/routes', 'POST', 201, 'SUCCESS', '192.168.1.101', 'Mozilla/5.0...', NOW()),
  (2, 2, 'ROUTE_UPDATED', 'Route', '/api/routes/1', 'PUT', 200, 'SUCCESS', '192.168.1.101', 'Mozilla/5.0...', NOW()),
  (2, 2, 'ROUTE_VIEWED', 'Route', '/api/routes', 'GET', 200, 'SUCCESS', '192.168.1.101', 'Mozilla/5.0...', NOW()),
  
  -- Driver Verification actions
  (2, 2, 'DRIVER_VERIFICATION_SUBMITTED', 'Driver Verification', '/api/driver-verification', 'POST', 201, 'SUCCESS', '192.168.1.101', 'Mozilla/5.0...', NOW()),
  (1, 1, 'DRIVER_VERIFICATION_UPDATED', 'Driver Verification', '/api/driver-verification/1', 'PUT', 200, 'SUCCESS', '192.168.1.100', 'Mozilla/5.0...', NOW()),
  (1, 1, 'DRIVER_LICENSES_VIEWED', 'Driver Verification', '/api/driver-licenses', 'GET', 200, 'SUCCESS', '192.168.1.100', 'Mozilla/5.0...', NOW()),
  
  -- System logs
  (NULL, NULL, 'SYSTEM_ERROR', 'System', '/api/system-health', 'GET', 500, 'ERROR', '127.0.0.1', 'Service', NOW());
```

## Required Database Schema

Ensure these tables exist:

```sql
CREATE TABLE User (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  role ENUM('ADMIN', 'DRIVER', 'PASSENGER') DEFAULT 'PASSENGER',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE AuditLog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT,
  user_id INT,
  action VARCHAR(100) NOT NULL,
  actionType VARCHAR(50) NOT NULL,
  endpoint VARCHAR(255),
  httpMethod VARCHAR(10),
  httpStatusCode INT,
  accessResult ENUM('SUCCESS', 'DENIED', 'ERROR') DEFAULT 'SUCCESS',
  ipAddress VARCHAR(45),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES User(id),
  INDEX idx_userId (userId),
  INDEX idx_actionType (actionType),
  INDEX idx_ipAddress (ipAddress),
  INDEX idx_accessResult (accessResult),
  INDEX idx_createdAt (createdAt)
);
```

## Test Data Checklist

Before running tests, verify:

- [ ] Admin user exists (admin123 / 123456789)
- [ ] At least 3 test users exist
- [ ] At least 30+ audit logs exist
- [ ] SUCCESS status logs exist (5+)
- [ ] DENIED status logs exist (3+)
- [ ] ERROR status logs exist (3+)
- [ ] Authentication action logs exist
- [ ] User Management action logs exist
- [ ] Vehicle Management action logs exist
- [ ] Booking action logs exist
- [ ] Review action logs exist
- [ ] Route action logs exist
- [ ] Driver Verification action logs exist
- [ ] Admin Actions logs exist
- [ ] System logs exist
- [ ] Logs with different IP addresses exist (5+)
- [ ] Logs span multiple dates (for date range filtering)

## Data Cleanup

After testing, you may want to clean up test data:

```sql
-- Delete test audit logs
DELETE FROM AuditLog WHERE createdAt >= NOW() - INTERVAL 1 DAY AND actionType IN (
  'Authentication', 'User Management', 'Vehicle Management', 'Booking', 'Review', 'Route', 'Driver Verification'
);

-- Delete test users (if needed)
DELETE FROM User WHERE username IN ('driver001', 'passenger001', 'admin002');
```

## Notes

1. **Password Hashing**: The password should be hashed using bcrypt. Use the same implementation as your application.
   - Password: `123456789`
   - The exact bcrypt hash depends on your salt rounds

2. **User Agent**: Can be any reasonable browser user agent string, e.g.:
   ```
   Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
   ```

3. **Timestamps**: All created dates should be recent to test properly.

4. **IP Addresses**: Use realistic RFC 1918 private IP addresses or actual test IPs.

5. **Action Types**: Must match exactly one of:
   - Authentication
   - User Management
   - Vehicle Management
   - Booking
   - Review
   - Route
   - Driver Verification
   - Admin Actions
   - System

## Alternative: SQL Dump

You can also create a SQL dump file that can be imported directly:

```bash
# Export
mysqldump --databases yourdb > test_data.sql

# Import
mysql < test_data.sql
```

---
**Last Updated**: 2026-03-03
