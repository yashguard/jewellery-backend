import joi from "joi";

class validation {
    /**
     * create-comment 
     */
    static create = {
        body: joi.object().keys({
            blog: joi.string().required(),
            name: joi.string().required(),
            email: joi.string().email().required(),
            comment: joi.string().required(),
        })
    };
}

export default validation;
