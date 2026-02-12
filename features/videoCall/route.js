import express from "express";
import controller from "../videoCall/controller.js";
import validation from "../videoCall/validation.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import {validate} from "../../middleware/validate.js";
import {checkPermission} from "../../middleware/role.js";
import {userRoleEnum} from "../../config/enum.js";

const route = express.Router();

/**create */
route.post(
    "/",
    verifyToken,
    checkPermission([
        userRoleEnum.CUSTOMER
    ]),
    validate(validation.create),
    controller.create
);

/**get */
route.get(
    "/:id?",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    controller.get
);

/**update */
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
