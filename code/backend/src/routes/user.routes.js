const express = require("express");
const userController = require("../controllers/user.controller");
<<<<<<< HEAD
const validate = require("../middlewares/validate");
const upload = require("../middlewares/upload.middleware");
const {
  idParamSchema,
  createUserSchema,
  updateMyProfileSchema,
  updateUserByAdminSchema,
  updateUserStatusSchema,
  listUsersQuerySchema,
} = require("../validations/user.validation");
const { protect, requireAdmin } = require("../middlewares/auth");
=======
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload.middleware');
const { anonymizeDeletedUsers } = require('../middlewares/anonymizeDeletedUsers');
const { idParamSchema, createUserSchema, updateMyProfileSchema, updateUserByAdminSchema, updateUserStatusSchema, listUsersQuerySchema } = require('../validations/user.validation');
const { protect, requireAdmin } = require('../middlewares/auth');
>>>>>>> origin/Phuri_2283

const router = express.Router();

// --- Admin Routes ---
// FOR TEST DELETE
// GET /api/users/admin
router.get(
  "/admin",
  protect,
  requireAdmin,
  validate({ query: listUsersQuerySchema }),
  userController.adminListUsers,
);

// PUT /api/users/admin/:id
router.put(
  "/admin/:id",
  protect,
  requireAdmin,
  upload.fields([
    { name: "nationalIdPhotoUrl", maxCount: 1 },
    { name: "selfiePhotoUrl", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  validate({ params: idParamSchema, body: updateUserByAdminSchema }),
  userController.adminUpdateUser,
);

// DELETE /api/users/admin/:id
router.delete(
  "/admin/:id",
  protect,
  requireAdmin,
  validate({ params: idParamSchema }),
  userController.adminDeleteUser,
);

// GET /api/users/admin/:id
router.get(
  "/admin/:id",
  protect,
  requireAdmin,
  validate({ params: idParamSchema }),
  userController.getUserById,
);

// PATCH /api/users/admin/:id/status
router.patch(
  "/admin/:id/status",
  protect,
  requireAdmin,
  validate({ params: idParamSchema, body: updateUserStatusSchema }),
  userController.setUserStatus,
);

// --- Public / User-specific Routes ---
// GET /api/users/me
<<<<<<< HEAD
router.get("/me", protect, userController.getMyUser);

// GET /api/users/:id
router.get(
  "/:id",
  validate({ params: idParamSchema }),
  userController.getUserPublicById,
=======
router.get(
    '/me',
    protect,
    userController.getMyUser
);
// GET /api/users/check-deletion-status
router.get(
    '/check-deletion-status',
    protect,
    userController.checkUserDeletionStatus
);

// GET /api/users/:id
router.get(
    '/:id',
    validate({ params: idParamSchema }),
    anonymizeDeletedUsers,
    userController.getUserPublicById
>>>>>>> origin/Phuri_2283
);

// POST /api/users
router.post(
  "/",
  upload.fields([
    { name: "nationalIdPhotoUrl", maxCount: 1 },
    { name: "selfiePhotoUrl", maxCount: 1 },
  ]),
  validate({ body: createUserSchema }),
  userController.createUser,
);

// PUT /api/users/me
router.put(
  "/me",
  protect,
  upload.fields([
    { name: "nationalIdPhotoUrl", maxCount: 1 },
    { name: "selfiePhotoUrl", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  validate({ body: updateMyProfileSchema }),
  userController.updateCurrentUserProfile,
);

<<<<<<< HEAD
module.exports = router;
=======
// DELETE /api/users/me
router.delete(
    '/me',
    protect,
    userController.deleteUserController
);



module.exports = router;
>>>>>>> origin/Phuri_2283
