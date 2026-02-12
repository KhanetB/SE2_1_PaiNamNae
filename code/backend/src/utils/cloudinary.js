const cloudinary = require("cloudinary").v2;
const ApiError = require("./ApiError");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);

          return reject(new ApiError(500, "Cloudinary upload failed."));
        }

        resolve({ url: result.secure_url, public_id: result.public_id });
      },
    );

    uploadStream.end(fileBuffer);
  });
};

const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Cloudinary Delete Error:", error);
        return reject(new ApiError(500, "Cloudinary deletion failed."));
      }
      resolve(result);
    });
  });
};

const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  try {
    const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error parsing Cloudinary URL: ", url, error);
    return null;
  }
};

const deleteManyFromCloudinary = async (imageUrls) => {
  if (!imageUrls || imageUrls.length === 0) return;

  const publicIds = imageUrls
    .map(getPublicIdFromUrl)
    .filter((id) => id !== null);

  if (publicIds.length === 0) return;

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    return null;
  }
};
module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  deleteManyFromCloudinary,
};
