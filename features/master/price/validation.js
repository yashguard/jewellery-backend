import Joi from "joi";
import {discountTypeEnum} from "../../../config/enum.js";

class validation {
    /**
     * Create price
     */
    static create = {
        body: Joi.object().keys({
            metal: Joi.string().required(),
            ratePerGram: Joi.number().required(),
            discountValue: Joi.number(),
            discountType: Joi.string().valid(...Object.values(discountTypeEnum)),
            discountDescription: Joi.string(),
            startAt: Joi.date(),
            endAt: Joi.date()
        })
    };

    /**
     * Update price
     */
    static update = {
        body: Joi.object().keys({
            metal: Joi.string(),
            ratePerGram: Joi.number(),
            discountValue: Joi.number(),
            discountType: Joi.string().valid(...Object.values(discountTypeEnum)),
            discountDescription: Joi.string(),
            startAt: Joi.date(),
            endAt: Joi.date()
        })
    };
}

export default validation;
