// import fs from "fs";
// import nodemailer from "nodemailer";
// import {config} from "../config/config.js";
// import path from "path";

// const mailTransport = nodemailer.createTransport({
//     host: config.email.smtp.host,
//     port: config.email.smtp.port,
//     secure: false,
//     auth: {
//         user: config.email.smtp.auth.user,
//         pass: config.email.smtp.auth.pass,
//     },
// });

// /**
//  * Send mail function
//  */
// export const sendMail = async ({to,subject,dynamicData,filename}) => {
//     let html = fs.readFileSync(path.join(process.cwd(),"pages",filename),
//         "utf-8"
//     );
//     Object.keys(dynamicData).forEach((key) => {
//         const regex = new RegExp(`\\{\\{${ key }\\}\\}`,"g");
//         html = html.replace(regex,dynamicData[ key ]);
//     });

//     const result = mailTransport.sendMail(
//         {
//             from: config.email.smtp.from,
//             to,
//             subject,
//             html,
//         },
//         async (err,info) => {
//             if (err) {
//                 console.log("err: ",err.message);
//                 return err.message;
//             } else {
//                 console.log(`mail successfully sent on ${ info.accepted[ 0 ] }`);
//                 return info;
//             }
//         }
//     );
//     return result;
// };

import fs from "fs";
import path from "path";
import { Resend } from "resend";
import { config } from "../config/config.js";

const resend = new Resend(config.resendAPIKey);

/**
 * Send mail function (Resend version)
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

    // Send email using Resend
    const response = await resend.emails.send({
      from: config.email.from, // e.g. "Admin <onboarding@resend.dev>"
      to,
      subject,
      html,
    });

    console.log("mail successfully sent:", response.data);
    return response;
  } catch (err) {
    console.log("err:", err.message);
    throw err;
  }
};
