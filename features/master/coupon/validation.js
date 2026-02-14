import Joi from "joi";

class validate {
    static create = {
        body: Joi.object().keys({
            code: Joi.string().required(),
            description: Joi.string().required(),
            discountType: Joi.string().required(),
            discountValue: Joi.number().required(),
            endDate: Joi.date(),
            isActive: Joi.boolean().default(false),
            validAmount: Joi.number().required(),
            savedAmount: Joi.number(),
            createdBy: Joi.string()
        })
    };

    static update = {
        body: Joi.object().keys({
            description: Joi.string(),
            endDate: Joi.date(),
            isActive: Joi.boolean(),
            createdBy: Joi.string()
        })
    };
}
export default validate;
