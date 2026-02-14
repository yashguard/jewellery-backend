import mongoose from "mongoose";
import {contactStatusEnum} from "../../config/enum.js";

/**PUBLIC - contact-us schema */
const mongooseSchema = new mongoose.Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String
        },
        phone: {
            type: Number
        },
        message: {
            type: String
        },
        status: {
            type: String,
            enum: Object.values(contactStatusEnum),
            default: contactStatusEnum.PENDING,
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ContactUsModel = mongoose.model("contactUs",mongooseSchema);
export default ContactUsModel;
