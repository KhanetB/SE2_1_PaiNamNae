const cron = require("node-cron");
const prisma = require("../utils/prisma");
const { all } = require("axios");
const { deleteManyFromCloudinary } = require("../utils/cloudinary");

const runCleanupLogic = async (userId) => {
  console.log("Running Account Cleanup Job...");

  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - 90);

  try {
    const usersToDelete = await prisma.user.findMany({
      where: {
        deletedAt: {
          not: null,
        },
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

    if (allImagesToDelete.length > 0) {
      await deleteManyFromCloudinary(allImagesToDelete);
    }

    const userIds = usersToDelete.map((u) => u.id);
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

    console.log(`Cleanup completed successfully. `);
  } catch (error) {
    console.error("Errro in cleanup cron:", error);
  }

  console.log("Account Cleanup Cron Job scheduled.");
};
const startCleanuoCron = () => {
  cron.schedule("0 0 * * *", runCleanupLogic);
};

module.exports = { startCleanuoCron, runCleanupLogic };
