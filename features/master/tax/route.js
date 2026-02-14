import express from "express";
import controller from "../tax/controller.js";
import {verifyToken} from "../../../middleware/verifyToken.js";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";
import validation from "../tax/validation.js";
import {validate} from "../../../middleware/validate.js";

const route = express.Router();

/**
 * Create
 */
route.post(
    "/",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER,
        userRoleEnum.PRODUCTMANAGER
    ]),
    validate(validation.create),
    controller.create
);

/**
 * Get
 */
route.get(
    "/:id?",
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
        userRoleEnum.MANAGER,
        userRoleEnum.PRODUCTMANAGER
    ]),
    validate(validation.create),
    controller.update
);

export default route;

