import multer from "multer";
import express from "express";
import {verifyToken} from "../../../middleware/verifyToken.js";
import controller from "../productVariants/controller.js";
import validation from "../productVariants/validation.js";
import {validate} from "../../../middleware/validate.js";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";

const route = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

route.post(
    "/",
    upload.array("files"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER,
    ]),
    validate(validation.create),
    controller.create
);

route.get(
    "/details/:id?",
    controller.getDetails
);

route.get(
    "/get/:id?",
    controller.getVariant
);

route.get(
    "/status-price/:id?",
    controller.getStatusAndPrice
);

route.get(
    "/admin/:id?",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.SELLER,
        userRoleEnum.PRODUCTMANAGER,
        userRoleEnum.CONTENTEDITOR,
        userRoleEnum.CUSTOMERSERVICE
    ]),
    controller.getByAdmin
);

route.patch(
    "/:id",
    upload.array("files"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER,
    ]),
    validate(validation.update),
    controller.update
);

route.patch(
    "/:id/cost/:costId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER,
    ]),
    validate(validation.updateCost),
    controller.updateCost
);

route.patch(
    "/:id/attribute/:attributeId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER,
    ]),
    validate(validation.updateAttribute),
    controller.updateAttribute
);

route.delete(
    "/:id/attribute/:attributeId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER,
    ]),
    controller.removeAttribute
);

route.delete(
    "/:id/cost/:costId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER,
    ]),
    controller.removeCost
);

export default route;
