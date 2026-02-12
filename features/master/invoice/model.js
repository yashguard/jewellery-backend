import mongoose from "mongoose";

/**Invoice schema */
const mongooseSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order"
        },
        invoiceTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        invoiceNumber: {
            type: String,
            unique: true
        },
        description: {
            type: String
        },
        price: {
            type: Number
        },
        note: {
            type: String
        },
        subTotal: {
            type: Number
        },
        tax: {
            type: Number
        },
        discount: {
            type: Number
        },
        totalAmount: {
            type: Number
        },
        to: {
            type: String
        },
        from: {
            type: String
        },
        subject: {
            type: String
        },
        message: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);
