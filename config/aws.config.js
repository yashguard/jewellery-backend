import aws from "@aws-sdk/client-s3";
import {config} from "./config.js";

export const s3Client = new aws.S3({
  forcePathStyle: false,
  endpoint: "https://blr1.digitaloceanspaces.com",
  region: config.cloud.digitalocean.region,
  credentials: {
    accessKeyId: config.cloud.digitalocean.access_key,
    secretAccessKey: config.cloud.digitalocean.secret_key,
  },
});
