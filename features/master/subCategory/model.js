import mongoose from "mongoose";

/**ADMIN - schema for sub-category */
const mongooseSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category"
        },
        title: {
            type: String,
        },
        description: {
            type: String
        },
        type: {
            type: String,
        },
        url: {
            type: String
        },
        slug: {
            type: String,
        },
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

const SubcategoryModel = mongoose.model("subcategory",mongooseSchema);
export default SubcategoryModel;
