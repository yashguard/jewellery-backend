import mongoose from "mongoose";
import {costTypeEnum,discountTypeEnum} from "../../../config/enum.js";

const productSchema = new mongoose.Schema(
    {
        title: {type: String,unique: true},
        name: {type: String},
        description: {type: String},
        manufacturerName: {type: String},
        files: [ {urls: {type: String}} ],
        sku: {type: String,unique: true},
        category: {type: mongoose.Types.ObjectId,ref: 'category'},
        subCategory: {type: mongoose.Types.ObjectId,ref: 'subCategory'},
        shopFor: {type: String},
        tag: {type: String},
        material: {type: String},
        occasion: {type: String},
        collections: {type: String},
        giftType: {type: String},
        slug: {type: String,unique: true},
        taxValue: {type: Number},
        hasVariant: {type: Boolean,default: false},
        isDraft: {type: Boolean,default: true},
        isRing: {type: Boolean,default: false},
        isFeatured: {type: Boolean,default: false},
        metalColor: {type: String},
        purity: {type: String},
        weight: {type: String},
        length: {type: String},
        width: {type: String},
        height: {type: String},
        size: {type: String},
        range: {type: String},
        price: {type: Number},
        grandTotal: {type: Number},
        subTotal: {type: Number,default: 0.00},
        availability: {type: Boolean,default: false},
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

const ProductModel = mongoose.model("product",productSchema);
export default ProductModel;
