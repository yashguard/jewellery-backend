import joi from "joi";
import {contactStatusEnum} from "../../config/enum.js";

class validation {
    /**
    * create
    */
    static create = {
        body: joi.object().keys({
            name: joi.string().required(),
            email: joi.string().email().required(),
            message: joi.string().required(),
            phone: joi.number().integer().required(),
        })
    };

    /**
     * update
     */
    static update = {
        body: joi.object().keys({
            status: joi.string().valid(...Object.values(contactStatusEnum)),
        })
    };
}

export default validation;
