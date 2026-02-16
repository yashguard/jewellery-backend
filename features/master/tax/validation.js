import joi from "joi";

class validation {
    /**create */
    static create = {
        body: joi.object().keys({
            taxValue: joi.number().required().default(0)
        })
    };
}

export default validation;
