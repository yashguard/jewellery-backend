import Joi from "joi";
import {returnOrderStatusEnum} from "../../config/enum.js";

class validation {
    /**
     * create
     */
    static create = {
        body: Joi.object().keys({
            orderId: Joi.string().required(),
            user: Joi.string(),
            reason: Joi.string().required(),
            status: Joi.string().valid(...Object.values(returnOrderStatusEnum.REQUESTED)),
        })
    };

    /**
     * update
     */
    static update = {
        body: Joi.object().keys({
            status: Joi.string().valid(...Object.values(returnOrderStatusEnum)),
            manageBy: Joi.string(),
        })
    };
}

export default validation;
