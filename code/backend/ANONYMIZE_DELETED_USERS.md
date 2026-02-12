# ระบบ Anonymize User Data สำหรับ Soft Deleted Users

## ภาพรวม

ระบบนี้ทำงานเพื่อปกป้องความเป็นส่วนตัวของ user ที่ลบบัญชีไปแล้ว (soft deleted) โดยจะทำการ anonymize ข้อมูลส่วนตัวทั้งหมดก่อนส่ง response กลับไปยัง client

## วิธีการทำงาน

### 1. การตรวจสอบ Soft Deleted User

ระบบจะตรวจสอบว่า user มี `deletedAt != null` หรือไม่ ถ้าใช่ จะถือว่า user นั้นถูก soft delete แล้ว

### 2. การ Anonymize ข้อมูล

เมื่อพบว่า user ถูก soft delete ระบบจะแทนที่ข้อมูลด้วยค่าดังนี้:

```javascript
{
  username: "deleted_user",
  email: "deleted@user.local",
  firstName: "Deleted",
  lastName: "User",
  gender: null,
  phoneNumber: null,
  profilePicture: null,
  nationalIdNumber: null,
  nationalIdPhotoUrl: null,
  selfiePhotoUrl: null,
  // เก็บข้อมูลที่จำเป็นสำหรับระบบ
  id: user.id,
  role: user.role,
  isVerified: false,
  isActive: false,
  deletedAt: user.deletedAt
}
```

## ไฟล์ที่เกี่ยวข้อง

### 1. Utility Functions
- **ไฟล์:** `code/backend/src/utils/anonymizeUser.js`
- **ฟังก์ชันหลัก:**
  - `isUserDeleted(user)` - ตรวจสอบว่า user ถูก soft delete หรือไม่
  - `anonymizeUser(user)` - anonymize ข้อมูล user object เดียว
  - `anonymizeUsersInObject(data, userFields)` - anonymize user ใน object
  - `anonymizeUsersInArray(dataArray, userFields)` - anonymize user ใน array
  - `anonymizeUsersRecursive(data, userFields)` - anonymize แบบ recursive (รองรับ nested objects)

### 2. Middleware
- **ไฟล์:** `code/backend/src/middlewares/anonymizeDeletedUsers.js`
- **Middleware:**
  - `anonymizeDeletedUsers` - middleware หลักสำหรับ anonymize response
  - `anonymizeDeletedUsersWithFields(userFields)` - middleware ที่ระบุ user fields ได้

### 3. Services (ที่ถูกแก้ไข)
- `code/backend/src/services/route.service.js` - เพิ่ม `deletedAt` ใน select statements
- `code/backend/src/services/booking.service.js` - เพิ่ม `deletedAt` ใน select statements
- `code/backend/src/services/user.service.js` - เพิ่ม `deletedAt` ใน getUserPublicById

### 4. Routes (ที่ใช้ middleware)
- `code/backend/src/routes/route.routes.js`
  - GET `/routes` - แสดงรายการเส้นทางทั้งหมด (แสดง driver info)
  - GET `/routes/:id` - แสดงรายละเอียดเส้นทาง (แสดง driver และ passenger info)
  - GET `/routes/me` - แสดงเส้นทางของ driver (แสดง passenger info)

- `code/backend/src/routes/booking.routes.js`
  - GET `/bookings/me` - แสดงการจองของ passenger (แสดง driver info)
  - GET `/bookings/:id` - แสดงรายละเอียดการจอง (แสดง passenger และ driver info)

- `code/backend/src/routes/user.routes.js`
  - GET `/users/:id` - แสดงข้อมูล public ของ user

## วิธีการใช้งาน

### การใช้ Middleware กับ Route

```javascript
const { anonymizeDeletedUsers } = require('../middlewares/anonymizeDeletedUsers');

// เพิ่ม middleware หลัง controller
router.get(
  '/routes',
  routeController.listRoutes,
  anonymizeDeletedUsers
);
```

### การใช้ Anonymize Function โดยตรง

```javascript
const { anonymizeUsersRecursive } = require('../utils/anonymizeUser');

// ใน service หรือ controller
const data = await getRouteData();
const anonymizedData = anonymizeUsersRecursive(data);
return anonymizedData;
```

## การทดสอบ

### ทดสอบด้วย API

1. **สร้าง user ทดสอบ:**
```bash
POST /api/users
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  ...
}
```

2. **Soft delete user:**
```bash
DELETE /api/users/admin/:userId
# หรือ user ลบบัญชีเอง
```

3. **ทดสอบ API ที่แสดงข้อมูล user:**
```bash
# ดูข้อมูล user ที่ถูก soft delete
GET /api/users/:userId

# ดูเส้นทางที่มี driver ที่ถูก soft delete
GET /api/routes

# ดูการจองที่มี passenger ที่ถูก soft delete
GET /api/bookings/me
```

4. **ตรวจสอบ response:**
   - ข้อมูลส่วนตัวควรถูกแทนที่ด้วย "Deleted User"
   - เฉพาะ id และข้อมูลพื้นฐานที่จำเป็นต่อระบบเท่านั้นที่ยังเหลืออยู่

### ตัวอย่าง Response ก่อนและหลัง Anonymize

**ก่อน (user ยังไม่ถูก soft delete):**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "profilePicture": "https://...",
    "deletedAt": null
  }
}
```

**หลัง (user ถูก soft delete แล้ว):**
```json
{
  "success": true,
  "data": {
    "id": "user123",
    "firstName": "Deleted",
    "lastName": "User",
    "email": "deleted@user.local",
    "profilePicture": null,
    "deletedAt": "2026-02-12T10:30:00.000Z"
  }
}
```

## หมายเหตุสำคัญ

### ข้อควรระวัง
1. **Admin Routes:** Admin routes ไม่ควรใช้ middleware นี้ เพราะ admin ต้องเห็นข้อมูลจริง
2. **Performance:** Middleware จะทำงานทุกครั้งที่มี response ดังนั้นควรใช้เฉพาะกับ routes ที่จำเป็น
3. **Nested Data:** ระบบรองรับ nested objects/arrays อัตโนมัติ แต่ต้องแน่ใจว่า services ได้ select `deletedAt` field

### ข้อดี
- ปกป้องความเป็นส่วนตัวของ user ที่ลบบัญชี
- ทำงานอัตโนมัติผ่าน middleware
- ไม่กระทบต่อ database queries
- รองรับ nested data structures

### ข้อจำกัด
- ต้อง select `deletedAt` field ทุก query ที่ต้องการ anonymize
- เพิ่ม processing overhead เล็กน้อยในการประมวลผล response
- Admin ต้องใช้ routes แยกต่างหากเพื่อดูข้อมูลจริง

## การขยายระบบ

### เพิ่ม Field ที่ต้องการ Anonymize

แก้ไขฟังก์ชัน `anonymizeUser` ใน `utils/anonymizeUser.js`:

```javascript
function anonymizeUser(user) {
  // ... existing code ...
  return {
    ...user,
    // เพิ่ม field ใหม่ที่ต้องการ anonymize
    newField: null,
  };
}
```

### เพิ่ม User Field ใหม่ที่ต้องการตรวจสอบ

```javascript
// ใช้ middleware แบบกำหนด fields เอง
const middleware = anonymizeDeletedUsersWithFields(['driver', 'passenger', 'user', 'creator']);

router.get('/api/something', controller, middleware);
```

## การ Maintain

- ตรวจสอบ services ใหม่ที่ query user data ว่าได้ select `deletedAt` field หรือไม่
- เพิ่ม middleware ให้กับ routes ใหม่ที่แสดงข้อมูล user บนหน้าบ้าน
- ทดสอบ anonymization หลังจาก deploy ทุกครั้งที่มีการเปลี่ยนแปลง user schema
