import joi from "joi";

class validation {
    /**
     * create
     */
    /**
* create
*/
    /**
* create
*/
    static create = {
        body: joi.object().keys({
            name: joi.string().required(),
            email: joi.string().email().required(),
            message: joi.string().required(),
            phone: joi.number().integer().required(),
        })
    };
}

export default validation;
