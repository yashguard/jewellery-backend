import express from "express";
import {userRoleEnum} from "../../../config/enum.js";
import {verifyToken} from "../../../middleware/verifyToken.js";
import {checkPermission} from "../../../middleware/role.js";
import {validate} from "../../../middleware/validate.js";
import validation from "../price/validation.js";
import controller from "./controller.js";

const route = express.Router();

/**
 * Create Price
 */
route.post(
    "/",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER
    ]),
    validate(validation.create),
    controller.create
);

/**
 * Get price
 */
route.get(
    "/:id?",
    verifyToken,
    controller.get
);

/**
 * Update price
 */
route.patch(
    "/:id",
    verifyToken,
    // validate(validation.update),
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER
    ]),
    controller.update
);

export default route;
