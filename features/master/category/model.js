import mongoose from "mongoose";

/**ADMIN - category schema */
const mongooseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
        },
        url: {
            type: String
        },
        description: {
            type: String
        },
        subCategory: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subcategory"
        } ],
        filters: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "filters"
        } ],
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

mongooseSchema.index({title: 1,type: 1});
const CategoryModel = mongoose.model("category",mongooseSchema);
export default CategoryModel;
