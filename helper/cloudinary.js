import cloudinary from "../config/cloudinary.config.js";
import { config } from "../config/config.js";

/**upload file */
export const uploadFile = async ({ filename, file }) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      public_id: filename,
      folder: config.cloudinary.cloudFolderName,
      resource_type: "auto", // supports image/video/pdf
    });

    return result;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
};

/**update file */
export const updateFile = async ({ filename, file }) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      public_id: filename,
      folder: config.cloudinary.cloudFolderName,
      overwrite: true, // important
      resource_type: "auto",
    });

    return result;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
};

/**delete file */
export const deleteFile = async ({ filename }) => {
  try {
    const publicId = `${config.cloudinary.cloudFolderName}/${filename}`;

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image", // or "auto" if mixed
    });

    console.log("File deleted:", publicId);
    return result;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
};

export const deleteMultipleFiles = async (filenames = []) => {
  try {
    const publicIds = filenames.map(
      (name) => `${config.cloudinary.cloudFolderName}/${name}`,
    );

    const result = await cloudinary.api.delete_resources(publicIds);

    console.log("Multiple files deleted");
    return result;
  } catch (error) {
    console.log("Error", error);
    throw error;
  }
};
