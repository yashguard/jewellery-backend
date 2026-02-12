import joi from "joi";

class validation {
    /**
     * create
     */
    static create = {
        body: joi.object().keys({
            title: joi.string().required(),
            description: joi.string().required(),
            images: joi.array().allow()
        })
    };

    /**
     * update
     */
    static update = {
        body: joi.object().keys({
            title: joi.string(),
            description: joi.string(),
            image: joi.string().allow()
        })
    };
}
export default validation;
