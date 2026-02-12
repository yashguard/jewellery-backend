import Joi from "joi";
import {pick} from "../helper/pick.js";
import {validateResponse} from "../helper/apiResponse.js";

export const validate = (schema) => (req,res,next) => {
    const validSchema = pick(schema,[ "params","query","body" ]);
    const object = pick(req,Object.keys(validSchema));
    const {value,error} = Joi.compile(validSchema)
        .prefs({errors: {label: "key"},abortEarly: false})
        .validate(object);

    if (error) {
        return validateResponse({
            res,
            error,
            statusCode: 400,
        });
    }
    Object.assign(req,value);
    return next();
};

