import joi from 'joi';

class validation {
    /**
     * create
     */
    static create = {
        body: joi.object().keys({
            category: joi.string().required(),
            title: joi.string().required(),
            filters: joi.array().items(joi.object({
                displayName: joi.string().required(),
                query: joi.string().required(),
                type: joi.string().required(),
            })).required(),
        })
    };

    /**
     * update
     */
    static update = {
        body: joi.object().keys({
            title: joi.string(),
            filters: joi.array().items(joi.object({
                displayName: joi.string().required(),
                query: joi.string().required(),
                type: joi.string().required(),
            }))
        })
    };

    /**
     * update single filter
     */
    static updateFilter = {
        body: joi.object().keys({
            displayName: joi.string(),
            query: joi.string(),
            type: joi.string(),
        })
    };
};

export default validation;
