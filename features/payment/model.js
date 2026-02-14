import mongoose from 'mongoose';
import {paymentStatusEnum} from '../../config/enum.js';

/**PAYMENT schema */
const mongooseSchema = new mongoose.Schema(
    {
        razorpayOrderId: {
            type: String
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order"
        },
        paymentId: {
            type: String,
            default: null
        },
        amount: {
            type: Number,
            required: true,
            default: 0
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
        },
        status: {
            type: String,
            enum: Object.values(paymentStatusEnum),
            default: paymentStatusEnum.PENDING,
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const PaymentModel = mongoose.model("payment",mongooseSchema);
export default PaymentModel;
