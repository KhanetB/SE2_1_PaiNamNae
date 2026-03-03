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
function anonymizeUser(user, options = {}) {
  const role = options.role || user?.role || 'USER';

  // 🔥 กรณี relation เป็น null
  if (!user) {
    return createDeletedUserPlaceholder(role);
  }

  // ยังไม่ถูกลบ
  if (!isUserDeleted(user)) {
    return {
      ...user,
      isAnonymized: false,
    };
  }

  // soft deleted
  return {
    ...user,
    username: 'deleted_user',
    email: 'deleted@user.local',
    firstName: role === 'DRIVER' ? 'ผู้ขับขี่' : 'ผู้ใช้',
    lastName: '',
    gender: null,
    phoneNumber: null,
    profilePicture: null,
    nationalIdNumber: null,
    nationalIdPhotoUrl: null,
    selfiePhotoUrl: null,
    isVerified: false,
    isActive: false,
    isAnonymized: true,
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
  if (result[field] !== undefined) {
    result[field] = anonymizeUser(result[field], {
      role: field === 'driver' ? 'DRIVER' : 'USER',
    });
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
  if (data === null || data === undefined) {
    return data;
  }

  // array
  if (Array.isArray(data)) {
    return data.map(item => anonymizeUsersRecursive(item, userFields));
  }

  // primitive
  if (typeof data !== 'object') {
    return data;
  }

  // special objects
  if (data instanceof Date || data instanceof RegExp) {
    return data;
  }

  const result = { ...data };

  for (const key of Object.keys(result)) {
    // 🔥 ถ้า key นี้คือ user field → anonymize ทันที (แม้ค่าเป็น null)
    if (userFields.includes(key)) {
      result[key] = anonymizeUser(result[key], {
        role: key === 'driver' ? 'DRIVER' : 'USER',
      });
      continue;
    }

    // 🔁 recursive ต่อ แม้ value จะเป็น null
    result[key] = anonymizeUsersRecursive(result[key], userFields);
  }

  return result;
}

function createDeletedUserPlaceholder(role = 'USER') {
  return {
    id: 'deleted',
    username: 'deleted_user',
    email: 'deleted@user.local',
    firstName: 'Deleted',
    lastName: 'User',
    gender: null,
    phoneNumber: null,
    profilePicture: null,
    role,
    isVerified: false,
    isActive: false,
    isAnonymized: true,
    deletedAt: new Date().toISOString(),
  };
}


module.exports = {
  isUserDeleted,
  anonymizeUser,
  anonymizeUsersInObject,
  anonymizeUsersInArray,
  anonymizeUsersRecursive,
  createDeletedUserPlaceholder,
};
