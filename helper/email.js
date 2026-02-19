// import fs from "fs";
// import nodemailer from "nodemailer";
// import { config } from "../config/config.js";
// import path from "path";

// const mailTransport = nodemailer.createTransport({
//   host: config.email.smtp.host,
//   port: config.email.smtp.port,
//   secure: false,
//   auth: {
//     user: config.email.smtp.auth.user,
//     pass: config.email.smtp.auth.pass,
//   },
// });

// /**
//  * Send mail function
//  */
// export const sendMail = async ({ to, subject, dynamicData, filename }) => {
//   let html = fs.readFileSync(
//     path.join(process.cwd(), "pages", filename),
//     "utf-8",
//   );
//   Object.keys(dynamicData).forEach((key) => {
//     const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
//     html = html.replace(regex, dynamicData[key]);
//   });

//   const result = mailTransport.sendMail(
//     {
//       from: config.email.smtp.from,
//       to,
//       subject,
//       html,
//     },
//     async (err, info) => {
//       if (err) {
//         console.log("err: ", err.message);
//         return err.message;
//       } else {
//         console.log(`mail successfully sent on ${info.accepted[0]}`);
//         return info;
//       }
//     },
//   );
//   return result;
// };

import fs from "fs";
import path from "path";
import sgMail from "@sendgrid/mail";
import { config } from "../config/config.js";

// Set API Key
sgMail.setApiKey(config.email.sendgridApiKey);

/**
 * Send mail function (SendGrid)
 */
export const sendMail = async ({ to, subject, dynamicData, filename }) => {
  try {
    let html = fs.readFileSync(
      path.join(process.cwd(), "pages", filename),
      "utf-8",
    );

    // Replace dynamic variables
    Object.keys(dynamicData).forEach((key) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      html = html.replace(regex, dynamicData[key]);
    });

    const msg = {
      to: Array.isArray(to) ? to : [to], // support single & multiple
      from: config.email.from, // must be verified in SendGrid
      subject,
      html,
    };

    const result = await sgMail.sendMultiple(msg);

    console.log("Mail sent successfully to:", msg.to);
    return result;
  } catch (error) {
    console.log("Error sending mail:", error.response?.body || error.message);
    throw error;
  }
};
