import joi from "joi";

class validation {
    /**
     * create appointment
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
            phone: joi.number().integer().required(),
            date: joi.date().required(),
            time: joi.string().required(),
            message: joi.string().required(),
            status: joi.string(),
        })
    };

    /**
     * update appointment
     */
    /**
     * update
     */
    static update = {
        body: joi.object().keys({
            date: joi.date(),
            time: joi.string(),
            status: joi.string(),
        })
    };
}
export default validation;
