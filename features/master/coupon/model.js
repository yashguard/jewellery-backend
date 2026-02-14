import mongoose from "mongoose";
import {discountTypeEnum} from "../../../config/enum.js";

/**ADMIN - coupon schema */
const mongooseSchema = new mongoose.Schema(
    {
        code: {type: String},
        description: {type: String},
        discountType: {type: String,enum: Object.values(discountTypeEnum)},
        validAmount: {type: Number},
        discountValue: {type: Number},
        endDate: {type: Date},
        isActive: {type: Boolean,default: false},
        savedAmount: {type: Number},
        createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "user"}
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const CouponModel = mongoose.model("coupon",mongooseSchema);
export default CouponModel;
