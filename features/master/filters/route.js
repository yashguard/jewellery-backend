import express from "express";
import {verifyToken} from "../../../middleware/verifyToken.js";
import controller from "../filters/controller.js";
import validation from "../filters/validation.js";
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
        userRoleEnum.PRODUCTMANAGER
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
        userRoleEnum.PRODUCTMANAGER
    ]),
    validate(validation.update),
    controller.update
);

/**
 * update filter
 */
route.patch(
    "/:id/filter/:filterId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER
    ]),
    validate(validation.updateFilter),
    controller.updateFilter
);

/**
 * delete single filter
 */
route.delete(
    "/:id/filter/:filterId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER
    ]),
    controller.deleteSingleFilter
);

/**
 * delete
 */
route.delete(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER
    ]),
    controller.delete
);

export default route;
