const cron = require("node-cron");
const prisma = require("../utils/prisma");
const { deleteManyFromCloudinary } = require("../utils/cloudinary");

// =============================================
// Account Cleanup Job (existing)
// =============================================
const runCleanupLogic = async () => {
  console.log("Running Account Cleanup Job...");

  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - 90);

  try {
    const usersToDelete = await prisma.user.findMany({
      where: {
        AND: [
          { deletedAt: { not: null } },
          { deletedAt: { lte: retentionDate } },
        ],
      },
      include: {
        driverVerification: true,
        vehicles: true,
      },
    });

    if (usersToDelete.length === 0) {
      console.log("No accounts to hard delete");
      return;
    }

    console.log(`Found ${usersToDelete.length} accounts to hard delete.`);

    let allImagesToDelete = [];

    for (const user of usersToDelete) {
      if (user.profilePicture) allImagesToDelete.push(user.profilePicture);
      if (user.selfiePhotoUrl) allImagesToDelete.push(user.selfiePhotoUrl);
      if (user.nationalIdPhotoUrl)
        allImagesToDelete.push(user.nationalIdPhotoUrl);
      if (user.driverVerification) {
        if (user.driverVerification.licensePhotoUrl) {
          allImagesToDelete.push(user.driverVerification.licensePhotoUrl);
        }
        if (user.driverVerification.selfiePhotoUrl) {
          allImagesToDelete.push(user.driverVerification.selfiePhotoUrl);
        }
      }

      if (user.vehicles && user.vehicles.length > 0) {
        user.vehicles.forEach((vehicle) => {
          if (vehicle.photos) {
            if (Array.isArray(vehicle.photos)) {
              allImagesToDelete.push(...vehicle.photos);
            } else {
              allImagesToDelete.push(vehicle.photos);
            }
          }
        });
      }
    }

    console.log("All Images To Delete: ", allImagesToDelete);

    if (allImagesToDelete.length > 0) {
      await deleteManyFromCloudinary(allImagesToDelete);
    }

    const ids = usersToDelete.map((u) => u.id);
    await prisma.$transaction(async (tx) => {
      await tx.driverVerification.deleteMany({
        where: { userId: { in: ids } },
      });

      await tx.vehicle.deleteMany({
        where: { userId: { in: ids } },
      });

      for (const id of ids) {
        await tx.user.delete({ where: { id } });
      }
    });

    console.log(`Cleanup completed successfully.`);
    return;
  } catch (error) {
    console.error("Error in cleanup cron:", error);
    return;
  }
};

// =============================================
// Audit Log Expiry Cleanup (พรบ.คอม มาตรา 26)
// =============================================
// Deletes expired audit logs (past expiresAt date).
// Must temporarily disable the immutability trigger.
const runAuditLogCleanup = async () => {
  console.log("[AuditLog] Running expired log cleanup...");

  try {
    const now = new Date();

    // Count expired records first
    const expiredCount = await prisma.auditLog.count({
      where: { expiresAt: { lt: now } },
    });

    if (expiredCount === 0) {
      console.log("[AuditLog] No expired records to clean up.");
      return;
    }

    console.log(`[AuditLog] Found ${expiredCount} expired records.`);

    // Temporarily disable delete trigger, perform cleanup, re-enable
    await prisma.$executeRawUnsafe(
      'ALTER TABLE "AuditLog" DISABLE TRIGGER prevent_audit_log_delete'
    );

    const deleted = await prisma.auditLog.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    await prisma.$executeRawUnsafe(
      'ALTER TABLE "AuditLog" ENABLE TRIGGER prevent_audit_log_delete'
    );

    console.log(`[AuditLog] Cleaned up ${deleted.count} expired records.`);
  } catch (error) {
    console.error("[AuditLog] Cleanup error:", error);
    // Re-enable trigger in case of error
    try {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "AuditLog" ENABLE TRIGGER prevent_audit_log_delete'
      );
    } catch (e) {
      console.error("[AuditLog] Failed to re-enable trigger:", e);
    }
  }
};

// =============================================
// Export Request SLA Monitor
// =============================================
// Marks expired export requests (past deadline).
const runExportSLAMonitor = async () => {
  console.log("[ExportSLA] Checking for expired export requests...");

  try {
    const now = new Date();

    const result = await prisma.exportRequest.updateMany({
      where: {
        status: { in: ["PENDING", "PROCESSING"] },
        deadline: { lt: now },
      },
      data: { status: "EXPIRED" },
    });

    if (result.count > 0) {
      console.log(`[ExportSLA] Marked ${result.count} requests as EXPIRED.`);
    }
  } catch (error) {
    console.error("[ExportSLA] Monitor error:", error);
  }
};

// =============================================
// Schedule All Cron Jobs
// =============================================
const startCleanuoCron = () => {
  // Account cleanup: daily at midnight
  cron.schedule("0 0 * * *", runCleanupLogic);

  // Audit log expiry cleanup: daily at 2:00 AM
  cron.schedule("0 2 * * *", runAuditLogCleanup);

  // Export SLA monitor: every hour
  cron.schedule("0 * * * *", runExportSLAMonitor);

  console.log("[Cron] All cron jobs scheduled.");
};

module.exports = {
  startCleanuoCron,
  runCleanupLogic,
  runAuditLogCleanup,
  runExportSLAMonitor,
};
