import { v4 as uuidv4 } from "uuid";
import { uploadFile, deleteFile } from "../../helper/cloudinary.js";

export const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const fileWithExt = parts.slice(-2).join("/");
    // e.g. folderName/file.jpg

    return fileWithExt.replace(/\.[^/.]+$/, "");
    // remove extension
  } catch (err) {
    console.log("Error extracting public_id", err);
    return null;
  }
};

export const uploadSingleFile = async (req, folderName) => {
  let fileUrl;

  if (req.file) {
    const { buffer: fileBuffer, originalname } = req.file;

    const fileExt = originalname.split(".").pop();
    const name = `${uuidv4()}.${fileExt}`;

    const publicId = `${folderName}/${name}`;

    // ⚠️ Convert buffer → base64 (required for Cloudinary)
    const base64File = `data:${req.file.mimetype};base64,${fileBuffer.toString("base64")}`;

    const result = await uploadFile({
      filename: publicId,
      file: base64File,
    });

    fileUrl = result.secure_url; // Cloudinary gives full CDN URL
  }

  return fileUrl;
};

export const updateFile = async (req, findDoc, folderName) => {
  let url;

  if (req.file) {
    const { buffer, originalname, mimetype } = req.file;

    const fileExt = originalname.split(".").pop();
    const newFilename = `${uuidv4()}.${fileExt}`;

    const publicId = `${folderName}/${newFilename}`;

    // Convert buffer → base64
    const base64File = `data:${mimetype};base64,${buffer.toString("base64")}`;

    // 🔥 delete old file (extract public_id from URL)
    if (findDoc && findDoc.url) {
      const oldPublicId = extractPublicId(findDoc.url);
      await deleteFile({ filename: oldPublicId });
    }

    const result = await uploadFile({
      filename: publicId,
      file: base64File,
    });

    url = result.secure_url;
  }

  return url;
};

export const uploadMultipleFiles = async (req, folderName) => {
  const files = [];

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const { originalname, buffer, mimetype } = file;

      const fileExt = originalname.split(".").pop();
      const newFilename = `${uuidv4()}.${fileExt}`;

      const publicId = `${folderName}/${newFilename}`;

      const base64File = `data:${mimetype};base64,${buffer.toString("base64")}`;

      const result = await uploadFile({
        filename: publicId,
        file: base64File,
      });

      files.push({ url: result.secure_url });
    }
  }

  return files;
};

export const updateMultipleFiles = async (req, findDoc, folderName) => {
  let files = [];

  if (findDoc) {
    files = findDoc.files || [];
  }

  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const { originalname, buffer, mimetype } = file;

      const fileExt = originalname.split(".").pop();
      const name = `${uuidv4()}.${fileExt}`;

      const publicId = `${folderName}/${name}`;

      const base64File = `data:${mimetype};base64,${buffer.toString("base64")}`;

      const result = await uploadFile({
        filename: publicId,
        file: base64File,
      });

      files.push({ url: result.secure_url });
    }
  }

  return files;
};
