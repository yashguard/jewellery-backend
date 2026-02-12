import express from "express";
import controller from "../privacyPolicy/controller.js";
import validation from "../privacyPolicy/validation.js";
import {verifyToken} from "../../../middleware/verifyToken.js";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";
import validate from "../../../middleware/validate.js";

const route = express.Router();

/**create */
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

/**get */
route.get(
    "/:id?",
    controller.get
);

/**update */
route.patch(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.CUSTOMERSERVICE
    ]),
    validate(validation.patch),
    controller.update
);

/**delete */
route.delete(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.CUSTOMERSERVICE
    ]),
    controller.delete
);

export default route;
