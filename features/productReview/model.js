import mongoose from "mongoose";

/**CUSTOMER - product review schema */
const mongooseSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        rating: {
            type: Number
        },
        title: {
            type: String
        },
        message: {
            type: String
        },
        files: [
            {
                urls: {
                    type: String
                }
            }
        ],
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ProductReviewModel = mongoose.model("productReview",mongooseSchema);
export default ProductReviewModel;
