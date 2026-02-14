import joi from "joi";
import {appointmentStatusEnum} from "../../config/enum.js";

class validation {
    /**
     * create
     */
    static create = {
        body: joi.object().keys({
            name: joi.string().required(),
            email: joi.string().email().required(),
            phone: joi.number().integer().required(),
            date: joi.date().required(),
            time: joi.string().required(),
            message: joi.string().required(),
            status: joi.string().valid(...Object.values(appointmentStatusEnum)),
        })
    };

    /**
     * update
     */
    static update = {
        body: joi.object().keys({
            date: joi.date(),
            time: joi.string(),
            status: joi.string().valid(...Object.values(appointmentStatusEnum)),
        })
    };
}
export default validation;
