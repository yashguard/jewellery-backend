import mongoose from "mongoose";

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
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ContactUsModel = mongoose.model("contactUs",mongooseSchema);
export default ContactUsModel;
