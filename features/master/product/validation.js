import Joi from "joi";
import {costTypeEnum,discountTypeEnum} from "../../../config/enum.js";

class validation {
    /**
     * create
     */
    static create = {
        body: Joi.object().keys({
            name: Joi.string(),
            description: Joi.string().required(),
            manufacturerName: Joi.string().required(),
            files: Joi.array(),
            sku: Joi.string().required(),
            category: Joi.string(),
            subCategory: Joi.string().optional(),
            createdBy: Joi.string(),
            shopFor: Joi.string().required(),
            tag: Joi.array(),
            material: Joi.string(),
            label: Joi.string().allow(null),
            occasion: Joi.string(),
            collections: Joi.string(),
            giftType: Joi.string(),
            slug: Joi.string(),
            title: Joi.string().required(),
            isDraft: Joi.boolean().required(),
            hasVariant: Joi.boolean().required(),
            isRing: Joi.boolean(),
            isFeatured: Joi.boolean(),
            availability: Joi.boolean(),
            metalColor: Joi.string().required(),
            purity: Joi.string().required(),
            weight: Joi.string(),
            length: Joi.string(),
            width: Joi.string(),
            height: Joi.string(),
            size: Joi.string(),
            range: Joi.string(),
            price: Joi.number(),
            taxAmount: Joi.number(),
            grandTotal: Joi.number().default(0.00),
            subTotal: Joi.number().default(0.00),
            taxValue: Joi.number().default(0.00),
            cost: Joi.array().items(Joi.object({
                ratePerGram: Joi.number(),
                costWeight: Joi.number(),
                metal: Joi.string().required(),
                amount: Joi.number(),
                costDiscount: Joi.number().default(0),
                saveCost: Joi.number().default(0),
                costType: Joi.string().valid(...Object.values(costTypeEnum)),
                costDiscountType: Joi.string().valid(...Object.values(discountTypeEnum)),
                totalCost: Joi.number().default(0),
            })),
            attributes: Joi.array().items(Joi.object({
                attTitle: Joi.string().required(),
                settingType: Joi.string(),
                attWeight: Joi.string(),
                attName: Joi.string().required(),
                number: Joi.number().required(),
            })),
            discountValue: Joi.number().default(0),
            savedAmount: Joi.number().default(0),
            discountType: Joi.string(),
            discountDescription: Joi.string(),
            quantity: Joi.number().required(),
            sales: Joi.number(),
            rating: Joi.number(),
            expiresOn: Joi.date()
        })
    };

    /**
     * update
     */
    static update = {
        body: Joi.object().keys({
            name: Joi.string(),
            description: Joi.string(),
            manufacturerName: Joi.string(),
            files: Joi.array(),
            label: Joi.string(),
            tag: Joi.array(),
            occasion: Joi.string(),
            shopFor: Joi.string(),
            material: Joi.string(),
            collections: Joi.string(),
            giftType: Joi.string(),
            discountDescription: Joi.string(),
            slug: Joi.string(),
            title: Joi.string(),
            metalColor: Joi.string(),
            purity: Joi.string(),
            weight: Joi.string(),
            taxAmount: Joi.number(),
            length: Joi.string(),
            width: Joi.string(),
            height: Joi.string(),
            size: Joi.string(),
            range: Joi.string(),
            isDraft: Joi.boolean(),
            hasVariant: Joi.boolean(),
            isRing: Joi.boolean(),
            isFeatured: Joi.boolean(),
            availability: Joi.boolean(),
            price: Joi.number(),
            grandTotal: Joi.number(),
            subTotal: Joi.number(),
            taxValue: Joi.number(),
            cost: Joi.array().items(Joi.object({
                ratePerGram: Joi.number(),
                costWeight: Joi.number(),
                metal: Joi.string().required(),
                amount: Joi.number(),
                costDiscount: Joi.number().default(0),
                saveCost: Joi.number().default(0),
                costType: Joi.string().valid(...Object.values(costTypeEnum)),
                costDiscountType: Joi.string().valid(...Object.values(discountTypeEnum)),
                totalCost: Joi.number().default(0),
            })),
            attributes: Joi.array().items(Joi.object({
                attTitle: Joi.string().required(),
                settingType: Joi.string(),
                attWeight: Joi.string(),
                attName: Joi.string().required(),
                number: Joi.number().required(),
            })),
            discountValue: Joi.number(),
            savedAmount: Joi.number(),
            discountType: Joi.string(),
            discountDescription: Joi.string(),
            quantity: Joi.number(),
            sales: Joi.number(),
            rating: Joi.number(),
            expiresOn: Joi.date()
        })
    };

    /**
     * update cost
    */
    static updateCost = {
        body: Joi.object().keys({
            ratePerGram: Joi.number().integer(),
            costWeight: Joi.number(),
            metal: Joi.string(),
            amount: Joi.number(),
            costDiscount: Joi.number(),
            saveCost: Joi.number(),
            costType: Joi.string().valid(...Object.values(costTypeEnum)),
            costDiscountType: Joi.string().valid(...Object.values(discountTypeEnum)),
            totalCost: Joi.number().integer()
        })
    };

    /**
     * update attributes 
     */
    static updateAttribute = {
        body: Joi.object().keys({
            attTitle: Joi.string(),
            attName: Joi.string(),
            settingType: Joi.string(),
            attWeight: Joi.string(),
            number: Joi.number().integer(),
        })
    };
}
export default validation;
