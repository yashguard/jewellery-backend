import express from "express";
import controller from "../comment/controller.js";
import validation from "../comment/validation.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import {checkPermission} from "../../middleware/role.js";
import {userRoleEnum} from "../../config/enum.js";
import {validate} from "../../middleware/validate.js";

const route = express.Router();

/**
 * create comment 
 */
route.post(
    "/",
    validate(validation.create),
    controller.create
);

/**
 * get comment 
 */
route.get(
    "/:id?",
    controller.get
);

/**
 * delete comment 
 */
route.delete(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,userRoleEnum.CONTENTEDITOR
    ]),
    controller.deleteComment
);

export default route;
