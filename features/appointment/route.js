import Express from "express";
import {verifyToken} from "../../middleware/verifyToken.js";
import controller from "../appointment/controller.js";
import validation from "../appointment/validation.js";
import {validate} from "../../middleware/validate.js";
import {checkPermission} from "../../middleware/role.js";
import {userRoleEnum} from "../../config/enum.js";

const route = Express.Router();

/**
 * create appointment 
 */
route.post(
    "/",
    verifyToken,
    checkPermission([
        userRoleEnum.CUSTOMER
    ]),
    validate(validation.create),
    controller.create
);

/**
 * get appointment
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
 * update appointment status 
 */
route.patch(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.update),
    controller.update
);

export default route;
