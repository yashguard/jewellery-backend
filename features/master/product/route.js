import express from "express";
import {verifyToken} from "../../../middleware/verifyToken.js";
import controller from "../product/controller.js";
import validation from "../product/validation.js";
import {validate} from "../../../middleware/validate.js";
import multer from "multer";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";

const route = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

// ----------------
// POST
// ----------------

route.post(
    "/",
    upload.array("files"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER
    ]),
    validate(validation.create),
    controller.create
);

// ----------------
// GET
// ----------------

route.get(
    "/category/:id?",
    controller.getProduct
);

route.get(
    "/details/:id?",
    controller.getProductDetails
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

// ----------------
// PATCH
// ----------------

// add: cost / attributes / files
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

// Update single cost
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

// Update single attribute
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

// ----------------
// DELETE
// ----------------

route.delete(
    "/:id/file/:fileId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER,
    ]),
    controller.deleteSingleFile
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
