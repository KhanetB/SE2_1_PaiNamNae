require("dotenv").config();

const archiver = require("archiver");
const nodemailer = require("nodemailer");
archiver.registerFormat("zip-encrypted", require("archiver-zip-encrypted"));

console.log("Check Email User:", process.env.EMAIL_USER);
console.log(
  "Check Email Pass:",
  process.env.EMAIL_PASS ? "Has Password" : "No Password",
);
// ตั้งค่าผู้ส่ง (Sender) - ส่วนนี้ต้องแก้ตาม Email Server ของบริษัทหรือใช้ Gmail ชั่วคราว
const transporter = nodemailer.createTransport({
  service: "gmail", // หรือ host: 'smtp.example.com'
  auth: {
    user: process.env.EMAIL_USER, // อีเมลระบบ (เก็บใน .env)
    pass: process.env.EMAIL_PASS, // รหัสผ่าน App Password (เก็บใน .env)
  },
});

exports.sendBackupEmail = async (toEmail, userData, zipPassword) => {
  // 1. แปลงข้อมูล JSON เป็น Buffer เพื่อเตรียมเป็นไฟล์แนบ
  const jsonString = JSON.stringify(userData, null, 2);
  const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const fileName = `my-data-${date}.json`;
  const zipFileName = `my-data-${date}.zip`;
  console.log("Zip Password: ", zipPassword);
  const archive = archiver("zip-encrypted", {
    zlib: { level: 8 },
    encryptionMethod: "aes256",
    password: zipPassword,
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.append(jsonString, { name: fileName });

  archive.finalize();

  // 2. ตั้งค่าเนื้อหาอีเมล
  const mailOptions = {
    from: `"PaiNumNae Support" <${process.env.EMAIL_USER}>`, // ชื่อผู้ส่ง
    to: toEmail, // อีเมลปลายทางที่ user กรอกมา
    subject: "Your Personal Data Archive (PDPA Request)",
    html: `
            <h3>เรียนผู้ใช้งาน,</h3>
            <p>ระบบได้รับคำขอลบบัญชีของคุณแล้ว</p>
            <p>ตามนโยบาย PDPA เราได้แนบไฟล์ข้อมูลส่วนตัวของคุณมาพร้อมกับอีเมลฉบับนี้ เพื่อให้คุณสามารถเก็บไว้เป็นข้อมูลอ้างอิงได้</p>
            <p style="color #d9534f; font-weight: bold;">รหัสผ่านสำหรับเปิดไฟล์ ZIP คือ: หมายเลขบัตรประชาชน 13 หลักของคุณ</p>
            <hr>
            
            <p><strong>วิธีเปิดไฟล์ ZIP:</strong></p>
            
            <p><strong>บนมือถือ (iOS / Android):</strong><br>
            สามารถเปิดไฟล์ ZIP ได้โดยตรง หรือใช้แอปจัดการไฟล์ทั่วไป</p>
            
            <p><strong>บน Windows:</strong><br>
            เนื่องจากไฟล์นี้ถูกเข้ารหัสแบบ AES-256 โปรแกรมแตกไฟล์ของ Windows อาจไม่รองรับ<br>
            แนะนำให้ใช้โปรแกรม เช่น:
            <ul>
              <li><a href="https://www.7-zip.org/">7-Zip (ฟรี)</a></li>
              <li><a href="https://www.win-rar.com/">WinRAR</a></li>
            </ul>
            เมื่อติดตั้งแล้ว ให้คลิกขวาที่ไฟล์ ZIP และเลือก Extract จากโปรแกรมดังกล่าว</p>
            <br>
            <p>ขอบคุณที่ใช้บริการของเรา</p>
        `,
    attachments: [
      {
        filename: zipFileName,
        content: archive,
        contentType: "application/zip",
      },
    ],
  };

  // 3. ส่งอีเมล
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send backup email");
  }
};

exports.sendOtpEmail = async (toEmail, otpCode) => {
  const mailOptions = {
    from: `"PaiNumNae Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "รหัส OTP สำหรับยืนยันการลบบัญชี (Account Deletion)",
    html: `
            <h3>เรียนผู้ใช้งาน,</h3>
            <p>คุณได้ทำการร้องขอเพื่อลบบัญชีผู้ใช้งานของคุณ</p>
            <p>รหัส OTP ของคุณคือ: <strong style="font-size: 24px; color: #d9534f;">${otpCode}</strong></p>
            <p>รหัสนี้มีอายุการใช้งาน <strong>5 นาที</strong></p>
            <br>
            <p style="color: red;">หากคุณไม่ได้เป็นผู้ดำเนินการ โปรดเพิกเฉยต่ออีเมลฉบับนี้ และแนะนำให้เปลี่ยนรหัสผ่านทันที</p>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
