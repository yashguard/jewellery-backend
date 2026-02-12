import mongoose from 'mongoose';
import {userRoleEnum,authProviderEnum} from "../../config/enum.js";

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
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            trim: true,
        },
        phone: {
            type: Number,
            unique: true
        },
        url: {
            type: String
        },
        dob: {
            type: Date
        },
        occupation: {
            type: String
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
