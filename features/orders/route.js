import express from "express";
import controller from "../orders/controller.js";
import validation from "../orders/validation.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import {validate} from "../../middleware/validate.js";
import {checkPermission} from "../../middleware/role.js";
import {userRoleEnum} from "../../config/enum.js";

const route = express.Router();

/**
 * update 
 */
route.post(
    "/:id",
    verifyToken,
    validate(validation.update),
    controller.update
);

/**
 * get 
 */
route.get(
    "/:id?",
    controller.getOrder
);

/**
 * update
 */
route.patch(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.SELLER
    ]),
    validate(validation.updateStatus),
    controller.updateStatus
);

export default route;
