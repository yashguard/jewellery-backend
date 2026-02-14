import mongoose from 'mongoose';
import {costTypeEnum,discountTypeEnum} from '../../../config/enum.js';

const mongooseSchema = new mongoose.Schema(
    {
        createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "user"},
        product: {type: mongoose.Schema.Types.ObjectId,ref: "product"},
        productSlug: {type: String},
        childSku: {type: String},
        shortDescription: {type: String},
        files: [ {urls: {type: String}} ],
        isDraft: {type: Boolean,default: true},
        title: {type: String},
        slug: {type: String},
        material: {type: String},
        metalColor: {type: String},
        purity: {type: String},
        availability: {type: Boolean,default: false},
        weight: {type: String},
        length: {type: String},
        width: {type: String},
        height: {type: String},
        size: {type: String},
        range: {type: String},
        price: {type: Number,default: 0},
        grandTotal: {type: Number},
        subTotal: {type: Number,default: 0.00},
        taxValue: {type: Number,default: 0},
        taxAmount: {type: Number},
        cost: [ {
            ratePerGram: Number,
            costWeight: Number,
            metal: String,
            amount: Number,
            costDiscount: {type: Number,default: 0},
            saveCost: {type: Number,default: 0},
            costType: {type: String,enum: Object.values(costTypeEnum)},
            costDiscountType: {type: String,enum: Object.values(discountTypeEnum)},
            totalCost: Number
        } ],
        totalCost: Number,
        attributes: [ {
            attTitle: String,
            attName: String,
            settingType: String,
            attWeight: String,
            number: Number,
        } ],
        discountDescription: {type: String},
        discountValue: {type: Number,default: 0},
        savedAmount: {type: Number,default: 0},
        discountType: {type: String,enum: Object.values(discountTypeEnum)},
        quantity: {type: Number},
        rating: {type: Number},
        sales: {type: Number,default: 0},
        expiresOn: {type: Date},
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ProductVariantModel = mongoose.model("productVariant",mongooseSchema);
export default ProductVariantModel;
