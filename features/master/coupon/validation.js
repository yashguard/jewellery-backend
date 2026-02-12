import Joi from "joi";

class validate {
    static create = {
        body: Joi.object().keys({
            code: Joi.string().required(),
            minimumSpend: Joi.number().required(),
            description: Joi.string().required(),
            discountType: Joi.string().required(),
            discountValue: Joi.number().required(),
            expiredTime: Joi.date(),
            validAmount: Joi.number().required(),
            savedAmount: Joi.number()
        })
    };

    static update = {
        body: Joi.object().keys({
            minimumSpend: Joi.number(),
            description: Joi.string(),
            expiredTime: Joi.date()
        })
    };
}
export default validate;
