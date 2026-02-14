import Joi from "joi";
import {costTypeEnum,discountTypeEnum} from "../../../config/enum.js";

class validation {
    /**
     * create
     */
    static create = {
        body: Joi.object().keys({
            createdBy: Joi.string(),
            product: Joi.string(),
            childSku: Joi.string().required(),
            shortDescription: Joi.string().required(),
            files: Joi.array().allow(),
            isDraft: Joi.boolean().default(true).required(),
            availability: Joi.boolean().default(false).required(),
            material: Joi.string(),
            metalColor: Joi.string().required(),
            purity: Joi.string().required(),
            diamondQuality: Joi.string(),
            title: Joi.string().required(),
            slug: Joi.string(),
            productSlug: Joi.string().required(),
            weight: Joi.string(),
            length: Joi.string(),
            width: Joi.string(),
            height: Joi.string(),
            size: Joi.string(),
            range: Joi.string(),
            price: Joi.number().integer(),
            grandTotal: Joi.number().integer(),
            subTotal: Joi.number().integer(),
            taxValue: Joi.number().integer(),
            attributes: Joi.array().items(Joi.object({
                attTitle: Joi.string().required(),
                settingType: Joi.string(),
                attWeight: Joi.string(),
                attName: Joi.string().required(),
                number: Joi.number().required(),
            })),
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
            discountValue: Joi.number().default(0),
            savedAmount: Joi.number().default(0),
            discountType: Joi.string().valid(...Object.values(discountTypeEnum)),
            discountDescription: Joi.string(),
            quantity: Joi.number().required(),
            rating: Joi.number(),
            taxAmount: Joi.number(),
            sales: Joi.number().default(0),
            expiresOn: Joi.date()
        })
    };

    /**
     * update
     */
    static update = {
        body: Joi.object().keys({
            shortDescription: Joi.string(),
            files: Joi.array().allow(),
            isDraft: Joi.boolean(),
            material: Joi.string(),
            metalColor: Joi.string(),
            purity: Joi.string(),
            title: Joi.string(),
            slug: Joi.string(),
            diamondQuality: Joi.string(),
            weight: Joi.string(),
            length: Joi.string(),
            width: Joi.string(),
            height: Joi.string(),
            size: Joi.string(),
            range: Joi.string(),
            price: Joi.number().integer(),
            taxAmount: Joi.number(),
            grandTotal: Joi.number().integer(),
            subTotal: Joi.number().integer(),
            taxValue: Joi.number().integer(),
            attributes: Joi.array().items(Joi.object({
                attTitle: Joi.string().required(),
                settingType: Joi.string(),
                attWeight: Joi.string(),
                attName: Joi.string().required(),
                number: Joi.number().required(),
            })),
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
            discountValue: Joi.number(),
            savedAmount: Joi.number(),
            discountType: Joi.string().valid(...Object.values(discountTypeEnum)),
            discountDescription: Joi.string(),
            quantity: Joi.number(),
            rating: Joi.number(),
            sales: Joi.number(),
            availability: Joi.boolean(),
            expiresOn: Joi.date()
        })
    };

    /**
     * update cost
     */
    static updateCost = {
        body: Joi.object().keys({
            metal: Joi.string(),
            subTotal: Joi.number(),
            costWeight: Joi.number(),
            taxValue: Joi.number(),
            costDiscount: Joi.number(),
            costType: Joi.string().valid(...Object.values(costTypeEnum)),
            costDiscountType: Joi.string().valid(...Object.values(discountTypeEnum))
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
            number: Joi.number(),
        })
    };
}
export default validation;
