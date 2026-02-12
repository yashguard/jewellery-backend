import mongoose from "mongoose";

/**PUBLIC - wishlist schema */
const mongooseSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        products: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        } ],
        variants: [ {
            type: mongoose.Schema.Types.ObjectId,
            ref: "productVariant"
        } ]
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const WishlistModel = mongoose.model("wishlist",mongooseSchema);
export default WishlistModel;
