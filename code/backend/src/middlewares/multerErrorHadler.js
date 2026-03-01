import multer from "multer";
import ApiError from "../utils/ApiError.js";

export const multerErrorHandler = (err, req, res, next) => {
  // Multer error
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(400, "File size must not exceed 10 MB"));
    }

    return next(new ApiError(400, err.message));
  }

  // Error จาก fileFilter
  if (err) {
    return next(err);
  }

  next();
};