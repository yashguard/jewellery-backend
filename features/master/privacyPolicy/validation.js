import joi from "joi";

class validation {
    /**create */
    static create = {
        body: joi.object().keys({
            title: joi.string().required(),
            shortDescription: joi.string().required(),
            longDescription: joi.string(),
            type: joi.string().required(),
        })

    };

    /**update */
    static patch = {
        body: joi.object().keys({
            title: joi.string(),
            shortDescription: joi.string(),
            longDescription: joi.string()
        })
    };
}

export default validation;
