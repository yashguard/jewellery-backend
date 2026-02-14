import mongoose from "mongoose";
import {discountTypeEnum} from "../../../config/enum.js";

/**Price breakup - Admin */
const mongooseSchema = new mongoose.Schema(
    {
        metal: {type: String},
        ratePerGram: {type: Number},
        discountValue: {type: Number,default: 0},
        discountType: {type: String,enum: Object.values(discountTypeEnum)},
        startAt: {type: Date},
        endAt: {type: Date},
        discountDescription: {type: String},
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const PriceModel = mongoose.model("price",mongooseSchema);
export default PriceModel;
