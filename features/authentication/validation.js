import joi from "joi";
import {userRoleEnum,authProviderEnum} from "../../config/enum.js";

class validation {
    /**
     * register
     */
    static register = {
        body: joi.object().keys({
            email: joi.string().email().required(),
            username: joi.string().required(),
            password: joi.string().required(),
            url: joi.string(),
            role: joi.string().default(userRoleEnum.CUSTOMER),
            phone: joi.number().integer(),
            otp: joi.number().integer(),
            otpExpiration: joi.date(),
            joiningDate: joi.date(),
            isActive: joi.boolean().default(false),
            isVerified: joi.boolean().default(false),
            authProvider: joi.string().default(authProviderEnum.LOCAL)
        })
    };

    /**
     * login
     */
    static login = {
        body: joi.object().keys({
            email: joi.string().email().required(),
            password: joi.string().required(),
        })
    };

    /**
     * update user info
     */
    static updateUserValidation = {
        params: joi.object({
            id: joi.string().required().trim(),
        }),
        body: joi.object().keys({
            username: joi.string().empty("").optional(),
            phone: joi.number().integer(),
            dob: joi.date(),
            occupation: joi.string(),
            oldPassword: joi.string(),
            newPassword: joi.string(),
            confirmPassword: joi.string(),
        })
    };

    /**
     * update by admin
     */
    static updateByAdmin = {
        params: joi.object({
            id: joi.string().required().trim(),
        }),
        body: joi.object().keys({
            username: joi.string().empty("").optional(),
            phone: joi.number().integer(),
            dob: joi.date(),
            occupation: joi.string(),
            role: joi.valid(...Object.values(userRoleEnum)),
            isActive: joi.boolean()
        })
    };

    /**
     * otp verification
     */
    static otpVerification = {
        body: joi.object().keys({
            otp: joi.number().integer().required(),
            email: joi.string().email().required(),
            otpExpiration: joi.date(),
            isVerified: joi.boolean()
        })
    };

    /**
     * forgot-password
     */
    static forgotPassword = {
        body: joi.object().keys({
            email: joi.string().email().lowercase().required(),
        })
    };

    /**
     * reset-password
     */
    static resetPassword = {
        body: joi.object().keys({
            newPassword: joi.string().required().label("newPassword"),
            confirmPassword: joi.string().valid(joi.ref("newPassword")).required(),
        })
    };

    /**
     * google-login
     */
    static googleLogin = {
        body: joi.object().keys({
            isActive: joi.boolean().default(true),
            isVerified: joi.boolean().default(true),
            token: joi.string(),
            authProvider: joi.string().valid(...Object.values(authProviderEnum.GOOGLE))
        })
    };
}

export default validation;
