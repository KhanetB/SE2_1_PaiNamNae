require('dotenv').config();

const nodemailer = require('nodemailer');

console.log("Check Email User:", process.env.EMAIL_USER); 
console.log("Check Email Pass:", process.env.EMAIL_PASS ? "Has Password" : "No Password");
// ตั้งค่าผู้ส่ง (Sender) - ส่วนนี้ต้องแก้ตาม Email Server ของบริษัทหรือใช้ Gmail ชั่วคราว
const transporter = nodemailer.createTransport({
    service: 'gmail', // หรือ host: 'smtp.example.com'
    auth: {
        user: process.env.EMAIL_USER, // อีเมลระบบ (เก็บใน .env)
        pass: process.env.EMAIL_PASS  // รหัสผ่าน App Password (เก็บใน .env)
    }
});

exports.sendBackupEmail = async (toEmail, userData) => {
    // 1. แปลงข้อมูล JSON เป็น Buffer เพื่อเตรียมเป็นไฟล์แนบ
    const jsonString = JSON.stringify(userData, null, 2);
    const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const fileName = `my-data-${date}.json`;

    // 2. ตั้งค่าเนื้อหาอีเมล
    const mailOptions = {
        from: `"PaiNumNae Support" <${process.env.EMAIL_USER}>`, // ชื่อผู้ส่ง
        to: toEmail, // อีเมลปลายทางที่ user กรอกมา
        subject: 'Your Personal Data Archive (PDPA Request)',
        html: `
            <h3>เรียนผู้ใช้งาน,</h3>
            <p>ระบบได้รับคำขอลบบัญชีของคุณแล้ว</p>
            <p>ตามนโยบาย PDPA เราได้แนบไฟล์ข้อมูลส่วนตัวของคุณมาพร้อมกับอีเมลฉบับนี้ เพื่อให้คุณสามารถเก็บไว้เป็นข้อมูลอ้างอิงได้</p>
            <br>
            <p>ขอบคุณที่ใช้บริการของเรา</p>
        `,
        attachments: [
            {
                filename: fileName,
                content: jsonString,
                contentType: 'application/json'
            }
        ]
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