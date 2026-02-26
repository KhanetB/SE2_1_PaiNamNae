const exportService = require('../services/export.service');

exports.downloadMyData = async (req, res, next) => {
    try {
        // สมมติว่า auth middleware แปะ user id ไว้ที่ req.user.id
        const userId = req.user.sub; 

        console.log(`[Export] User ${userId} requested data export.`);

        // เรียก Service
        const userData = await exportService.generateUserData(userId);

        // แปลง Object เป็น JSON String (จัดหน้าสวยงามด้วย null, 2)
        const jsonString = JSON.stringify(userData, null, 2);

        const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const fileName = `my-data-${date}.json`;

        // ตั้ง Header เพื่อบังคับให้ Browser ดาวน์โหลดไฟล์
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'application/json');

        // ส่งข้อมูลกลับ
        res.status(200).send(jsonString);

    } catch (error) {
        console.error('[Export Error]', error);
        next(error); // ส่งต่อให้ Error Handler ของคุณ
    }
};