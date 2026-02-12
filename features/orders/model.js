import mongoose from "mongoose";
import {orderStatusEnum} from "../../config/enum.js";

/**Address schema */
const addressSchema = new mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    phoneNumber: {type: Number},
    email: {type: String},
    addressLine1: {type: String},
    addressLine2: {type: String},
    postalCode: {type: Number},
    city: {type: String},
    state: {type: String},
});

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

/**Order schema */
const mongooseSchema = new mongoose.Schema(
    {
        invoiceId: {type: String,unique: true},
        orderId: {type: String,unique: true},
        user: {type: mongoose.Schema.Types.ObjectId,ref: "user"},
        items: [ cartItemSchema ],
        totalAmount: {type: Number},
        sameAsShippingAddress: {type: Boolean,default: true},
        shippingAddress: addressSchema,
        billingAddress: addressSchema,
        status: {type: String,enum: Object.values(orderStatusEnum),default: orderStatusEnum.PENDING},
        expectedDeliveryDate: {type: Date},
        deliveryDate: {type: Date},
        couponCode: {type: mongoose.Schema.Types.ObjectId,ref: "coupon"},
        cart: {type: mongoose.Schema.Types.ObjectId,ref: "cart"},
        couponDiscount: {type: Number},
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const OrderModel = mongoose.model("order",mongooseSchema);
export default OrderModel;
