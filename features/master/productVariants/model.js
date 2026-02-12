import mongoose from 'mongoose';
import {costTypeEnum,discountTypeEnum} from '../../../config/enum.js';

const mongooseSchema = new mongoose.Schema(
    {
        product: {type: mongoose.Schema.Types.ObjectId,ref: 'product'},
        childSku: {type: String,unique: true},
        shortDescription: {type: String},
        files: [ {urls: {type: String}} ],
        isDraft: {type: Boolean,default: true},
        name: {type: String},
        title: {type: String,unique: true},
        slug: {type: String},
        material: {type: String},
        metalColor: {type: String},
        purity: {type: String},
        status: {type: String},
        weight: {type: String},
        length: {type: String},
        width: {type: String},
        height: {type: String},
        size: {type: String},
        range: {type: String},
        diamondQuality: {type: String},
        price: {type: Number},
        grandTotal: {type: Number},
        subTotal: {type: Number,default: 0.00},
        taxValue: {type: Number,default: 0},
        cost: [ {
            ratePerGram: Number,
            costWeight: Number,
            costName: String,
            amount: Number,
            costDiscount: {type: Number,default: 0},
            saveCost: {type: Number,default: 0},
            costType: {type: String,enum: Object.values(costTypeEnum)},
            costDiscountType: {type: String,enum: Object.values(discountTypeEnum)},
            totalCost: Number
        } ],
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
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const ProductVariantModel = mongoose.model("productVariant",mongooseSchema);
export default ProductVariantModel;
