import mongoose from 'mongoose';
import {userRoleEnum,authProviderEnum,connectionTypeEnum,genderTypeEnum} from "../../config/enum.js";

const authSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            lowercase: true,
            trim: true,
        },
        email: {
            type: String,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            trim: true,
        },
        phone: {
            type: Number,
        },
        url: {
            type: String,
            default: null
        },
        dob: {
            type: Date,
            default: null
        },
        joiningDate: {
            type: Date
        },
        authProvider: {
            type: String,
            enum: Object.values(authProviderEnum),
            default: authProviderEnum.LOCAL
        },
        isActive: {
            type: Boolean,
            default: false
        },
        otp: {
            type: Number
        },
        otpExpiration: {
            type: Date
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            enum: Object.values(userRoleEnum),
            default: userRoleEnum.CUSTOMER
        },
        customerId: {
            type: String,
            default: null
        },
        empId: {
            type: Number,
            default: null
        },
        gender: {
            type: String,
            enum: Object.values(genderTypeEnum),
            default: null
        },
        address: {
            type: String,
            default: null
        },
        gmail: {
            type: String,
            default: null
        },
        facebook: {
            type: String,
            default: null
        },
        instagram: {
            type: String,
            default: null
        },
        linkedin: {
            type: String,
            default: null
        },
        twitter: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

authSchema.index({username: 1,email: 1,role: 1});

const AuthModel = mongoose.model("user",authSchema);
export default AuthModel;
