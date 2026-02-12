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
        } ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const BannerModel = mongoose.model("banner",mongooseSchema);
export default BannerModel;
