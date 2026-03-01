const { anonymizeUsersRecursive } = require('../utils/anonymizeUser');

/**
 * Middleware สำหรับ anonymize ข้อมูล user ที่ถูก soft deleted ใน response
 * ใช้สำหรับ API ที่แสดงผลหน้าบ้าน (public APIs)
 * 
 * การใช้งาน:
 * - ใส่ middleware นี้หลังจาก controller ที่ต้องการปกป้องข้อมูล
 * - middleware จะตรวจสอบและ anonymize ข้อมูล user ที่มี deletedAt != null
 * 
 * ตัวอย่าง:
 * router.get('/routes', getAllRoutes, anonymizeDeletedUsers);
 */
function anonymizeDeletedUsers(req, res, next) {
  // เก็บ res.json เดิมไว้
  const originalJson = res.json.bind(res);

  // Override res.json
  res.json = function (data) {
    try {
      // ถ้ามี data field (response format: { success, message, data })
      if (data && typeof data === 'object') {
        if (data.data !== undefined) {
          // Anonymous ข้อมูลใน data field
          data.data = anonymizeUsersRecursive(data.data);
        } else {
          // Anonymous ข้อมูลทั้งหมด (กรณี response เป็น object เปล่า)
          data = anonymizeUsersRecursive(data);
        }
      }
    } catch (error) {
      console.error('Error anonymizing deleted users:', error);
      // ถ้า error ให้ส่ง response ต้นฉบับ
    }

    // เรียก res.json เดิม
    return originalJson(data);
  };

  next();
}

/**
 * Middleware สำหรับ anonymize เฉพาะ API ที่ระบุ user fields
 * @param {Array<string>} userFields - ชื่อ fields ที่เป็น user object
 */
function anonymizeDeletedUsersWithFields(userFields = ['driver', 'passenger', 'user']) {
  return function (req, res, next) {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      try {
        if (data && typeof data === 'object') {
          if (data.data !== undefined) {
            data.data = anonymizeUsersRecursive(data.data, userFields);
          } else {
            data = anonymizeUsersRecursive(data, userFields);
          }
        }
      } catch (error) {
        console.error('Error anonymizing deleted users:', error);
      }

      return originalJson(data);
    };

    next();
  };
}

module.exports = {
  anonymizeDeletedUsers,
  anonymizeDeletedUsersWithFields,
};
