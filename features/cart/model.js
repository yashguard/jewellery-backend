import mongoose from "mongoose";

/**Cart item schema */
const cartItemSchema = new mongoose.Schema(
    {
        product: {type: mongoose.Schema.Types.ObjectId,ref: "product"},
        variant: {type: mongoose.Schema.Types.ObjectId,ref: "productVariant"},
        quantity: {type: Number,default: 1,min: 1},
        size: {type: Number},
        price: {type: Number},
        unitPrice: {type: Number},
        savedAmount: {type: Number,default: 0}
    }
);

/**USER - shopping cart schema */
const mongooseSchema = new mongoose.Schema(
    {
        user: {type: mongoose.Schema.Types.ObjectId,ref: "user"},
        items: [ cartItemSchema ],
        subTotal: {type: Number},
        couponCode: {type: mongoose.Schema.Types.ObjectId,ref: "coupon"},
        couponDiscount: {type: Number},
        totalCost: {type: Number}
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const CartModel = mongoose.model("cart",mongooseSchema);
export default CartModel;
