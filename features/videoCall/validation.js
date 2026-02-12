import Joi from "joi";
import {videoCallStatusEnum} from "../../config/enum.js";

class validation {
    /**
     * create
     */
    static create = {
        body: Joi.object().keys({
            language: Joi.string(),
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            phone: Joi.number().required(),
            date: Joi.date().required(),
            time: Joi.string().required(),
            status: Joi.string().valid(...Object.values(videoCallStatusEnum)),
        })
    };

    /**
     * update
     */
    static update = {
        body: Joi.object().keys({
            date: Joi.date(),
            time: Joi.string(),
            status: Joi.string().valid(...Object.values(videoCallStatusEnum)),
        })
    };
}

export default validation;
