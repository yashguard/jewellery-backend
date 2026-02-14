import joi from "joi";

class validation {
    /**create */
    static create = {
        body: joi.object().keys({
            type: joi.string().required(),
            title: joi.string().required(),
            category: joi.string().required(),
            description: joi.string(),
            image: joi.string(),
            slug: joi.string(),
            createdBy: joi.string(),
        })
    };

    /**update */
    static update = {
        body: joi.object().keys({
            title: joi.string(),
            type: joi.string(),
            description: joi.string(),
            title: joi.string(),
            image: joi.string(),
            createdBy: joi.string(),
            slug: joi.string()
        })
    };
}

export default validation;
