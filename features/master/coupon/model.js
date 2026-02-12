import mongoose from "mongoose";
import {discountTypeEnum} from "../../../config/enum.js";

/**ADMIN - coupon schema */
const mongooseSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            unique: true
        },
        minimumSpend: {
            type: Number
        },
        description: {
            type: String
        },
        discountType: {
            type: String,
            enum: Object.values(discountTypeEnum)
        },
        validAmount: {
            type: Number
        },
        discountValue: {
            type: Number
        },
        expiredTime: {
            type: Date
        },
        savedAmount: {
            type: Number
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const CouponModel = mongoose.model("coupon",mongooseSchema);
export default CouponModel;
