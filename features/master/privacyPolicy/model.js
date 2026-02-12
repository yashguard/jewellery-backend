import mongoose from "mongoose";

/**ADMIN - privacy policy schema */
const mongooseSchema = new mongoose.Schema(
    {
        title: {
            type: String
        },
        shortDescription: {
            type: String
        },
        longDescription: {
            type: String
        },
        type: {
            type: String,
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const PrivacyPolicyModel = mongoose.model("privacyPolicy",mongooseSchema);
export default PrivacyPolicyModel;
