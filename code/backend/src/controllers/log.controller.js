const asyncHandler = require("express-async-handler");
const logService = require("../services/log.service");
const archiver = require("archiver");
const getLogs = asyncHandler(async (req, res) => {
  const {
    startDate,
    endDate,
    userId,
    username,
    ipAddress,
    action,
    accessResult,
    page = 1,
    pageLimit = 25,
  } = req.query;

  const result = await logService.getAllLogs({
    startDate,
    endDate,
    userId,
    username,
    ipAddress,
    action: action ? action.split(",") : undefined,
    accessResult,
    page: parseInt(page),
    pageLimit: parseInt(pageLimit),
  });

  res.status(200).json({
    success: true,
    message: "Logs retrived successfully",
    ...result,
  });
});

const verifyIntegrity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 500;
  const result = await logService.verifyChainIntegrity(limit);

  res.status(200).json({
    success: true,
    message: result.valid
      ? "Records integrity verified — all checked records intact"
      : `Records integrity BROKEN at record ${result.corruptAt}`,
    data: result,
  });
});

const exportLogs = asyncHandler(async (req, res, next) => {
  const {
    startDate,
    endDate,
    userId,
    username,
    ipAddress,
    action,
    accessResult,
    userFields,
  } = req.query;

  const filters = {
    startDate,
    endDate,
    userId,
    ipAddress,
    action: action ? action.split(",") : undefined,
    username,
    accessResult,
  };

  const selectedUserFileds = userFields
    ? userFields.split(",").map((f) => f.trim())
    : [];

  const secureExport = await logService.exportLogSecurely(
    filters,
    selectedUserFileds,
    "",
    "",
  );

  const publicKey =
    process.env.SYSTEM_PUBLIC_KEY || "PUBLIC KEY NOT CONFIGURED";
  const howtoContent = `คู่มือการตรวจสอบควาถูกต้องของไฟล์ (Audit Log Integrity Verification)
  ข้อมูลในแพ็กเกจนี้ประกอบด้วย
  1. audit_log.csv - ข้อมูลบันทึกการใช้งานระบบ
  2. signature.sig - ลายมือชื่ออิเล็กทรอนิกส์ (Digital Signature) ที่สร้างด้วย Private Key ของระบบ
  3. public_key.pem - กุญแจสาธารณะสำหรับใช้ตรวจสอบ
  
  วิธีการตรวจสอบด้วย OpenSSL:
  -----------------------
  ขั้นตอนที่ 1: เปิด Command Line (Terminal) แล้วเข้าไปโฟลเดอร์ที่แตกไฟล์ zip นี้ไว้
  ขั้นตอนที่ 2: แปลงไฟล์ signature กลับเป็นรูปแบบ binary
    สำหรับผู้ใช้ Linux: base64 -d signature.sig > signature.bin
    สำหรับผู้ใช้ Windows: certutil -decode signature.sig signature.bin
    สำหรับผู้ใช้ MacOS: base64 -D -i signature.sig -o signature.bin
  ขั้นตอนที่ 3: ใช้ OpenSSL ตรวจสอบความถูกต้องของไฟล์
    คำสั่ง: openssl dgst -sha256 -verify public_key.pem -signature signature.bin audit_log.csv
    สำหรับผู้ใช้ Windows กรณีไม่ได้ทำการติดตั้ง openssl ในเครื่องให้ทำการติดตั้งโดยใช้คำสั่ง winget install openssl
  การแปลผลลัพธ์
  [Verifed OK] -> ไฟล์ถูกต้องสมบูรณ์ 100% ไม่ถูกดัดแปลง สามารถใช้เป็นพยานหลักฐานได้
  [Verification Failure] -> ไฟล์ถูกแก้ไข ดัดแปลง หรือข้อมูลไม่ตรงกัน ไม่สามารถใช้เป็นพยานหลักฐานได้`;

  const now = new Date();
  const date = now.toISOString().split("T")[0];
  const time = now.toTimeString().split(" ")[0].replace(/:/g, "-");
  const zipFileName = `audit-evidence-${date}_${time}.zip`;

  res.setHeader("Content-Disposition", `attachment; filename=${zipFileName}`);
  res.setHeader("Content-Type", "application/zip");

  const archive = archiver("zip", {
    zlib: { level: 9 },
  });
  archive.on("error", (err) => {
    res.status(500);
    return next(err);
  });

  archive.pipe(res);

  archive.append(secureExport.csvContent, { name: "audit_log.csv" });
  archive.append(secureExport.signature, { name: "signature.sig" });
  archive.append(publicKey, { name: "public_key.pem" });
  archive.append(howtoContent, { name: "howto.txt" });

  await archive.finalize();
});
module.exports = { getLogs, verifyIntegrity, exportLogs };
