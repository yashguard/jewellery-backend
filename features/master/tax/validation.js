import joi from "joi";

class validation {
    /**create */
    static create = {
        body: joi.object().keys({
            taxValue: joi.number().required()
        })
    };
}

export default validation;
