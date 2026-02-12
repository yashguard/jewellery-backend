import joi from "joi";

class validation {
    /**
     * create-comment 
     */
    /**
* create
*/
    /**
* create
*/
    static create = {
        body: joi.object().keys({
            blog: joi.string().required(),
            name: joi.string().required(),
            email: joi.string().email().required(),
            message: joi.string().required(),
        })
    };
}

export default validation;
