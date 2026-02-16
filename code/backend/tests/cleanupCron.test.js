const { runCleanupLogic } = require("../src/cron/cleanupCron");
const prisma = require("../src/utils/prisma");
const { deleteManyFromCloudinary } = require("../src/utils/cloudinary");

jest.mock("../src/utils/prisma", () => ({
  user: {
    findMany: jest.fn(),
  },
  driverVerification: {
    deleteMany: jest.fn(),
  },
  vehicle: {
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn((callback) => callback(prisma)),
}));

jest.mock("../src/utils/cloudinary", () => ({
  deleteManyFromCloudinary: jest.fn(),
}));

describe("Account Cleanup Cron Job", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("Should do nothing if no users found", async () => {
    prisma.user.findMany.mockResolvedValue([]);

    await runCleanupLogic();

    expect(prisma.user.findMany).toHaveBeenCalled();
    expect(deleteManyFromCloudinary).not.toHaveBeenCalled();
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  test("Should process cleanup successfully for a user", async () => {
    const mockUser = {
      id: "",
      profilePictre: "",
      vechicles: [],
      driverVerification: false,
    };
    prisma.user.findMany.mockResolvedValue([mockUser]);
    deleteManyFromCloudinary.mockResolvedValue({
      deleted: { "v1/profile": "deleted" },
    });

    await runCleanupLogic();

    expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    expect(deleteManyFromCloudinary).toHaveBeenCalledWith([
      mockUser.profilePictre,
    ]);
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
