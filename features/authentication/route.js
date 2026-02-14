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

// ----------------------
// POST
// ----------------------

route.post(
    "/register",
    upload.single("image"),
    validate(validation.register),
    controller.register
);

route.post(
    "/addStaff",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.addStaff),
    controller.addStaff
);

route.post(
    "/login",
    validate(validation.login),
    controller.login
);

route.post(
    "/verifyToken",
    controller.verifyToken
);

route.post(
    "/google/login",
    validate(validation.googleLogin),
    controller.googleLogin
);

route.post(
    "/forgot-password",
    validate(validation.forgotPassword),
    controller.forgotPassword
);

route.post(
    "/verifyOtp",
    validate(validation.otpVerification),
    controller.otpVerification
);

route.post(
    "/resendOtp",
    controller.resendOTP
);

// ----------------------
// PATCH
// ----------------------

route.patch(
    "/resetPassword",
    validate(validation.resetPassword),
    controller.resetPassword
);

route.patch(
    "/:id",
    upload.single("image"),
    verifyToken,
    validate(validation.updateUserValidation),
    controller.updateUserController
);

route.patch(
    "/:id/role",
    verifyToken,
    validate(validation.updateByAdmin),
    checkPermission([ userRoleEnum.ADMIN ]),
    controller.updateRole
);

// ----------------------
// GET
// ----------------------

route.get(
    "/admin/:id?",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    controller.getAllUsers
);

route.get(
    "/customer/:id?",
    verifyToken,
    controller.getCustomer
);

route.get(
    "/details/:id?",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER,
        userRoleEnum.SELLER,
        userRoleEnum.PRODUCTMANAGER,
        userRoleEnum.CONTENTEDITOR,
        userRoleEnum.CUSTOMERSERVICE
    ]),
    controller.customerDetails
);

route.get(
    "/staff",
    verifyToken,
    // checkPermission([
    //     userRoleEnum.ADMIN,
    //     userRoleEnum.MANAGER,
    //     userRoleEnum.SELLER,
    //     userRoleEnum.PRODUCTMANAGER,
    //     userRoleEnum.CONTENTEDITOR,
    //     userRoleEnum.CUSTOMERSERVICE
    // ]),
    controller.getStaff
);

route.get(
    "/staff-details/:id?",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER,
        userRoleEnum.SELLER,
        userRoleEnum.PRODUCTMANAGER,
        userRoleEnum.CONTENTEDITOR,
        userRoleEnum.CUSTOMERSERVICE
    ]),
    controller.staffDetails
);

export default route;
