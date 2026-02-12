import express from "express";
import {verifyToken} from "../../../middleware/verifyToken.js";
import controller from "../FAQ/controller.js";
import validation from "../FAQ/validate.js";
import {validate} from "../../../middleware/validate.js";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";

const route = express.Router();

/**
 * create 
 */
route.post(
    "/",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.CUSTOMERSERVICE
    ]),
    validate(validation.create),
    controller.create
);

/**
 * get
 */
route.get(
    "/:id?",
    controller.get
);

/**
 * update
 */
route.patch(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.CUSTOMERSERVICE
    ]),
    validate(validation.update),
    controller.update
);

/**
 * delete
 */
route.delete(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.CUSTOMERSERVICE
    ]),
    controller.deleteFaq
);

export default route;
