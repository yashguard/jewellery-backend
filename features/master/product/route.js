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

/**
 * add product
 */
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

/**
 * get
 */
route.get(
    "/category/:id?",
    controller.getProduct
);

/**
 * get details
 */
route.get(
    "/details/:id?",
    controller.getProductDetails
);

/**
 * get by admin
 */
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

/**
 * update product
 * (add: cost / attributes / files)
 */
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

/**
 * delete single file
 */
route.delete(
    "/:id/file/:fileId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER,
    ]),
    controller.deleteSingleFile
);

/**
 * update single cost
 */
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

/**
 * update single attribute
 */
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

/**
 * remove single attribute
 */
route.delete(
    "/:id/attribute/:attributeId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER,
    ]),
    controller.removeAttribute
);

/**
 * remove single cost
 */
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
