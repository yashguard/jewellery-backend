import joi from 'joi';
import {homePageTypeEnum} from '../../../config/enum.js';

class validation {
    /**
     * create
     */
    static create = {
        body: joi.object().keys({
            category: joi.string(),
            subCategory: joi.string(),
            redirectUrl: joi.string(),
            title: joi.string(),
            range: joi.string(),
            type: joi.string().valid(...Object.values(homePageTypeEnum)).required(),
            files: joi.array(),
            giftTitle: joi.string()
        })
    };

    /**
     * Update
     */
    static update = {
        body: joi.object().keys({
            category: joi.string().allow(null),
            subCategory: joi.string().allow(null),
            redirectUrl: joi.string().allow(null),
            title: joi.string().allow(null),
            range: joi.string().allow(null),
            type: joi.string().valid(...Object.values(homePageTypeEnum)),
            files: joi.array(),
            giftTitle: joi.string().allow(null)
        })
    };

    /**
     * Update single record
     */
    static updateSingleRecord = {
        body: joi.object().keys({
            range: joi.string(),
            title: joi.string(),
            redirectUrl: joi.string(),
            category: joi.string(),
            subCategory: joi.string(),
            giftTitle: joi.string()
        })
    };
};

export default validation;
