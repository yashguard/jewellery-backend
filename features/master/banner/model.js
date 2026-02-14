import mongoose from "mongoose";

/**ADMIN - banner schema */
const mongooseSchema = new mongoose.Schema(
    {
        title: {
            type: String
        },
        description: {
            type: String
        },
        files: [ {
            urls: {
                type: String
            }
        } ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const BannerModel = mongoose.model("banner",mongooseSchema);
export default BannerModel;
