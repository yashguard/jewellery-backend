import mongoose from "mongoose";

/**ADMIN - category schema */
const mongooseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            unique: true
        },
        url: {
            type: String
        },
        description: {
            type: String
        },
        type: {
            type: String
        },
        subCategory: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subCategory"
        } ],
        filters: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "filters"
        } ],
        slug: {
            type: String,
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
