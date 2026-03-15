const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const emailService = require("./email.service"); 

exports.generateAndSendDeleteOtp = async (userId, userEmail) => {
  // 1. สร้าง OTP 6 หลัก (000000 - 999999)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // 2. ตั้งเวลาหมดอายุ 5 นาทีจากเวลาปัจจุบัน
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); 

  // 3. บันทึกลง Database
  await prisma.user.update({
    where: { id: userId },
    data: {
      deleteOtp: otpCode,
      deleteOtpExpiresAt: expiresAt,
    },
  });

  // 4. ส่ง Email
  await emailService.sendOtpEmail(userEmail, otpCode);
  
  return { message: "OTP sent successfully", expiresIn: "5 minutes" };
};

exports.verifyDeleteOtp = async (userId, inputOtp) => {
  // 1. ดึงข้อมูล OTP จากผู้ใช้
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deleteOtp: true, deleteOtpExpiresAt: true },
  });

  if (!user || !user.deleteOtp) {
    throw new Error("OTP_NOT_REQUESTED");
  }

  // 2. ตรวจสอบเวลาหมดอายุ
  if (new Date() > user.deleteOtpExpiresAt) {
    // ล้าง OTP ทิ้งเมื่อหมดอายุแล้ว
    await prisma.user.update({
      where: { id: userId },
      data: { deleteOtp: null, deleteOtpExpiresAt: null },
    });
    throw new Error("OTP_EXPIRED");
  }

  // 3. ตรวจสอบความถูกต้องของตัวเลข
  if (user.deleteOtp !== inputOtp) {
    throw new Error("INVALID_OTP");
  }

  // 4. ตรวจสอบผ่าน ล้างข้อมูล OTP ทิ้ง เพื่อป้องกันการใช้ซ้ำ
  await prisma.user.update({
    where: { id: userId },
    data: { deleteOtp: null, deleteOtpExpiresAt: null },
  });

  return true;
};