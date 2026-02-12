import {PutObjectCommand,DeleteObjectCommand} from "@aws-sdk/client-s3";
import {config} from "../config/config.js";
import {s3Client} from "../config/aws.config.js";

/**upload file */
export const uploadFile = async ({filename,file,ACL}) => {
  try {
    const bucketParams = {
      Bucket: config.cloud.digitalocean.bucket_name,
      Key: filename,
      Body: file,
      ACL: ACL || "public-read",
    };

    const data = await s3Client.send(new PutObjectCommand(bucketParams));
    return data;
  } catch (error) {
    console.log("Error",error);
    throw error;
  }
};

/**update file */
export const updateFile = async ({oldFilename,filename,file,ACL}) => {
  try {
    if (oldFilename) {
      await deleteFile({
        filename: oldFilename,
      });
    }
    return await uploadFile({
      filename,
      file,
      ACL,
    });
  } catch (error) {
    console.log("Error",error);
    throw error;
  }
};

/**delete file */
export const deleteFile = async ({filename}) => {
  try {
    const deleteBucket = {
      Bucket: config.cloud.digitalocean.bucket_name,
      Key: filename,
    };

    await s3Client.send(new DeleteObjectCommand(deleteBucket));
    console.log("File is deleted.",filename);
  } catch (error) {
    console.log("Error",error);
    throw error;
  }
};
