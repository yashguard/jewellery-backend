import Joi from "joi";
import {addressTypeEnum,orderStatusEnum} from "../../config/enum.js";

class validation {
    /**
     * create order
     */
    static update = {
        body: Joi.object().keys({
            invoiceId: Joi.string(),
            shippingAddress: Joi.object().keys({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                phoneNumber: Joi.number().required(),
                email: Joi.string().email().required(),
                addressLine1: Joi.string().required(),
                addressLine2: Joi.string(),
                postalCode: Joi.number().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                addressType: Joi.string().valid(...Object.values(addressTypeEnum)),
            }).required(),
            sameAsShippingAddress: Joi.boolean().default(true),
            totalAmount: Joi.number(),
            billingAddress: Joi.object().keys({
                firstName: Joi.string().required(),
                lastName: Joi.string().required(),
                phoneNumber: Joi.number().required(),
                email: Joi.string().email().required(),
                addressLine1: Joi.string().required(),
                addressLine2: Joi.string(),
                postalCode: Joi.number().required(),
                city: Joi.string().required(),
                state: Joi.string().required(),
                addressType: Joi.string().valid(...Object.values(addressTypeEnum)),
            }),
            expectedDeliveryDate: Joi.date(),
            addressType: Joi.string().valid(...Object.values(addressTypeEnum)),
            status: Joi.string().valid(...Object.values(orderStatusEnum)),
            orderId: Joi.string()
        })
    };

    /**
     * update status
     */
    static updateStatus = {
        body: Joi.object().keys({
            status: Joi.string().valid(...Object.values(orderStatusEnum)),
            deliveryDate: Joi.date()
        })
    };
}

export default validation;
