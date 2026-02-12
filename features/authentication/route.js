import {userRoleEnum} from "../../config/enum.js";
import {checkPermission} from "../../middleware/role.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import controller from "../authentication/controller.js";
import validation from "../authentication/validation.js";
import {validate} from "../../middleware/validate.js";
import express from "express";
import multer from "multer";

const route = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**
 * register
 */
route.post(
    "/register",
    upload.single("image"),
    validate(validation.register),
    controller.register
);

/**
 * login 
 */
route.post(
    "/login",
    validate(validation.login),
    controller.login
);

/**
 * verify token
 */
route.post(
    "/verifyToken",
    controller.verifyToken
);

/**
 * login with google
 */
route.post(
    "/google/login",
    validate(validation.googleLogin),
    controller.googleLogin
);

/**
 * forgot password
 */
route.post(
    "/forgot-password",
    validate(validation.forgotPassword),
    controller.forgotPassword
);

/**
 * reset password
 */
route.patch(
    "/resetPassword",
    validate(validation.resetPassword),
    controller.resetPassword
);

/**
 * get all users by admin
 */
route.get(
    "/admin/:id?",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    controller.getAllUsers
);

/**
 * get customer
 */
route.get(
    "/customer/:id?",
    verifyToken,
    controller.get
);

/**
 * update user with change password
 */
route.patch(
    "/:id",
    upload.single("image"),
    verifyToken,
    validate(validation.updateUserValidation),
    controller.updateUserController
);

/**
 * update role
 */
route.patch(
    "/:id/role",
    verifyToken,
    validate(validation.updateByAdmin),
    checkPermission([ userRoleEnum.ADMIN ]),
    controller.updateRole
);

/**
 * otp verification
 */
route.post(
    "/verifyOtp",
    validate(validation.otpVerification),
    controller.otpVerification
);

/**
 * resend otp verification 
 */
route.post(
    "/resendOtp",
    controller.resendOTP
);

export default route;
