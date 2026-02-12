import Joi from "joi";

class validation {
    static order = {
        body: Joi.object().keys({
            amount: Joi.number(),
            orderId: Joi.string(),
            currency: Joi.string().required(),
        })
    };
    static payment = {
        body: Joi.object().keys({
            status: Joi.string(),
            razorpayOrderId: Joi.string().required(),
            paymentId: Joi.string(),
            signature: Joi.string(),
        })
    };
    static refund = {
        body: Joi.object().keys({
            amount: Joi.number().required(),
            paymentId: Joi.string(),
            status: Joi.string()
        })
    };
}
export default validation;
