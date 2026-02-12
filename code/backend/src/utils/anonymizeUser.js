/**
 * Utility สำหรับการ anonymize ข้อมูล user ที่ถูก soft deleted
 * ใช้สำหรับปกป้องความเป็นส่วนตัวของ user ที่ลบบัญชีไปแล้ว
 */

/**
 * ตรวจสอบว่า user ถูก soft deleted หรือไม่
 * @param {Object} user - user object ที่ต้องการตรวจสอบ
 * @returns {boolean} - true ถ้า user ถูก soft deleted
 */
function isUserDeleted(user) {
  return user && user.deletedAt !== null && user.deletedAt !== undefined;
}

/**
 * Anonymous ข้อมูล user object
 * @param {Object} user - user object ที่ต้องการ anonymize
 * @returns {Object} - user object ที่ถูก anonymize แล้ว
 */
function anonymizeUser(user) {
  if (!user) return user;
  
  // ถ้า user ไม่ได้ถูก soft delete ให้คืนค่าเดิม
  if (!isUserDeleted(user)) {
    return user;
  }

  // Anonymous ข้อมูลส่วนตัว
  return {
    ...user,
    username: 'deleted_user',
    email: 'deleted@user.local',
    firstName: 'Deleted',
    lastName: 'User',
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
    deletedAt: user.deletedAt,
  };
}

/**
 * Anonymous ข้อมูล user ใน object (เช่น route, booking)
 * @param {Object} data - object ที่มีข้อมูล user
 * @param {Array<string>} userFields - ชื่อ fields ที่เป็น user object (เช่น ['driver', 'passenger'])
 * @returns {Object} - object ที่ถูก anonymize แล้ว
 */
function anonymizeUsersInObject(data, userFields = ['driver', 'passenger', 'user']) {
  if (!data) return data;

  const result = { ...data };
  
  for (const field of userFields) {
    if (result[field]) {
      result[field] = anonymizeUser(result[field]);
    }
  }

  return result;
}

/**
 * Anonymous ข้อมูล user ใน array of objects
 * @param {Array} dataArray - array ของ objects ที่มีข้อมูล user
 * @param {Array<string>} userFields - ชื่อ fields ที่เป็น user object
 * @returns {Array} - array ที่ถูก anonymize แล้ว
 */
function anonymizeUsersInArray(dataArray, userFields = ['driver', 'passenger', 'user']) {
  if (!Array.isArray(dataArray)) return dataArray;

  return dataArray.map(item => anonymizeUsersInObject(item, userFields));
}

/**
 * Anonymous ข้อมูล user แบบ recursive (สำหรับ nested objects)
 * @param {*} data - ข้อมูลที่ต้องการ anonymize
 * @param {Array<string>} userFields - ชื่อ fields ที่เป็น user object
 * @returns {*} - ข้อมูลที่ถูก anonymize แล้ว
 */
function anonymizeUsersRecursive(data, userFields = ['driver', 'passenger', 'user']) {
  if (!data) return data;

  // ถ้าเป็น array
  if (Array.isArray(data)) {
    return data.map(item => anonymizeUsersRecursive(item, userFields));
  }

  // ถ้าไม่ใช่ object ให้คืนค่าเดิม
  if (typeof data !== 'object') {
    return data;
  }

  // สร้าง object ใหม่
  const result = { ...data };

  // ตรวจสอบและ anonymize user fields
  for (const field of userFields) {
    if (result[field]) {
      result[field] = anonymizeUser(result[field]);
    }
  }

  // ตรวจสอบ nested objects/arrays
  for (const key in result) {
    if (result[key] && typeof result[key] === 'object' && !userFields.includes(key)) {
      result[key] = anonymizeUsersRecursive(result[key], userFields);
    }
  }

  return result;
}

module.exports = {
  isUserDeleted,
  anonymizeUser,
  anonymizeUsersInObject,
  anonymizeUsersInArray,
  anonymizeUsersRecursive,
};
