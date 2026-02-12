import joi from "joi";

class validation {
    /**
     * create
     */
    static create = {
        body: joi.object().keys({
            question: joi.string().required(),
            answer: joi.string().required(),
            type: joi.string().required()
        })
    };

    /**
     * update
     */
    static update = {
        body: joi.object().keys({
            question: joi.string(),
            answer: joi.string(),
            type: joi.string()
        })
    };
}
export default validation;
