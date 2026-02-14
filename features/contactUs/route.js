import express from "express";
import controller from "../contactUs/controller.js";
import validation from "../contactUs/validation.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import {checkPermission} from "../../middleware/role.js";
import {userRoleEnum} from "../../config/enum.js";
import {validate} from "../../middleware/validate.js";

const route = express.Router();

/**
 * Create
 */
route.post(
    "/",
    validate(validation.create),
    controller.create
);

/**
 * Get
 */
route.get(
    "/:id?",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    controller.get
);

/**
 * Update
 */
route.patch(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.update),
    controller.updateStatus
);

/**
 * Delete
 */
route.delete(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    controller.deleteContact
);

export default route;
