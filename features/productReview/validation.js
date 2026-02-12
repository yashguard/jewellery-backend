import joi from "joi";

class validation {
    /**
     * create
     */
    static create = {
        body: joi.object().keys({
            product: joi.string(),
            title: joi.string().required(),
            message: joi.string().required(),
            user: joi.string(),
            files: joi.string().allow(),
            rating: joi.number().required()
        })
    };
}
export default validation;
