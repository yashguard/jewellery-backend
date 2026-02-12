import Joi from "joi";
import {aboutUsTypeEnum,mediaTypeEnum} from "../../../config/enum.js";

class validation {
    /**
     * create team
     */
    static createTeam = {
        body: Joi.object().keys({
            type: Joi.string().valid(...Object.values(aboutUsTypeEnum)).required(),
            file: Joi.string(),
            name: Joi.string().required(),
            designation: Joi.string().required(),
            media: Joi.array().items(Joi.object({
                link: Joi.string().required(),
                mediaType: Joi.string().valid(...Object.values(mediaTypeEnum)).required(),
            })),
        })
    };

    /**
     * create percentage
     */
    static createPercentage = {
        body: Joi.object().keys({
            file: Joi.string(),
            type: Joi.string().valid(...Object.values(aboutUsTypeEnum)).required(),
            description: Joi.string().required(),
            headTitle: Joi.string().required(),
            scores: Joi.array().items(Joi.object({
                scoreTitle: Joi.string().required(),
                isProgress: Joi.boolean().required(),
                symbol: Joi.string().required(),
                number: Joi.number().required(),
            })).required(),
        })
    };

    /**
     * update
     */
    static update = {
        body: Joi.object().keys({
            description: Joi.string(),
            headTitle: Joi.string(),
            file: Joi.string(),
            name: Joi.string(),
            designation: Joi.string(),
            media: Joi.array().items(Joi.object({
                link: Joi.string().required(),
                mediaType: Joi.string().valid(...Object.values(mediaTypeEnum)).required()
            })),
            scores: Joi.array().items(Joi.object({
                scoreTitle: Joi.string().required(),
                isProgress: Joi.boolean().required(),
                symbol: Joi.string().required(),
                number: Joi.number().required(),
            }))
        })
    };

    /**
     * update scores / media
     */
    static updateKey = {
        body: Joi.object().keys({
            scoreTitle: Joi.string(),
            isProgress: Joi.boolean(),
            symbol: Joi.string(),
            number: Joi.number(),
            link: Joi.string(),
            mediaType: Joi.string().valid(...Object.values(mediaTypeEnum))
        })
    };

    /**
     * upload video
     */
    static uploadVideo = {
        body: Joi.object().keys({
            video: Joi.string().allow()
        })
    };
}

export default validation;
