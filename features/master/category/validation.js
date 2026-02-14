import joi from "joi";

class validation {
    /**
     * create
     */
    static create = {
        body: joi.object().keys({
            title: joi.string().required(),
            description: joi.string(),
            url: joi.string().allow(),
            slug: joi.string(),
            createdBy: joi.string(),
            image: joi.string().allow(),
        })
    };

    /**
     * update
     */
    static update = {
        body: joi.object().keys({
            createdBy: joi.string(),
            title: joi.string(),
            url: joi.string().allow(),
            description: joi.string(),
            slug: joi.string(),
            image: joi.string().allow()
        })
    };
}

export default validation;
