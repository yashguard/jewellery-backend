import mongoose from "mongoose";
import {returnOrderStatusEnum} from "../../config/enum.js";

/**Return order schema */
const mongooseSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order"
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        reason: {
            type: String
        },
        manageBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        status: {
            type: String,
            enum: Object.values(returnOrderStatusEnum),
            default: returnOrderStatusEnum.REQUESTED
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ReturnOrderModel = mongoose.model("returnOrder",mongooseSchema);
export default ReturnOrderModel;
