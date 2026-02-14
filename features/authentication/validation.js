import joi from "joi";
import {userRoleEnum,authProviderEnum,connectionTypeEnum,genderTypeEnum} from "../../config/enum.js";

class validation {
    /**
     * register
     */
    static register = {
        body: joi.object().keys({
            email: joi.string().email().required(),
            username: joi.string().required(),
            password: joi.string().required(),
            url: joi.string().allow(null),
            role: joi.string().default(userRoleEnum.CUSTOMER),
            phone: joi.number().integer(),
            otp: joi.number().integer(),
            otpExpiration: joi.date(),
            joiningDate: joi.date(),
            isActive: joi.boolean().default(false),
            isVerified: joi.boolean().default(false),
            customerId: joi.string(),
            image: joi.string().allow(),
            authProvider: joi.string().default(authProviderEnum.LOCAL),
            connection: joi.array().items(joi.object().keys({
                link: joi.string().required(),
                connectionType: joi.string().valid(...Object.values(connectionTypeEnum))
            }))
        })
    };

    /**
     * Add staff
     */
    static addStaff = {
        body: joi.object().keys({
            username: joi.string().required(),
            email: joi.string().email().required(),
            role: joi.valid(...Object.values(userRoleEnum)).required(),
            password: joi.string().required(),
            confirmPassword: joi.string().required(),
            joiningDate: joi.date().required(),
            empId: joi.number().required(),
            phone: joi.number().required()
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
            gender: joi.string().valid(...Object.values(genderTypeEnum)),
            address: joi.string(),
            image: joi.string().allow(),
            oldPassword: joi.string(),
            newPassword: joi.string(),
            confirmPassword: joi.string(),
            gmail: joi.string(),
            facebook: joi.string(),
            instagram: joi.string(),
            linkedin: joi.string(),
            twitter: joi.string(),
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
            customerId: joi.string(),
            isActive: joi.boolean().default(true),
            isVerified: joi.boolean().default(true),
            token: joi.string(),
            authProvider: joi.string().valid(...Object.values(authProviderEnum.GOOGLE))
        })
    };
}

export default validation;
