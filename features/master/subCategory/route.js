import express from "express";
import controller from "../subCategory/controller.js";
import {verifyToken} from "../../../middleware/verifyToken.js";
import multer from "multer";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";
import validation from "../subCategory/validation.js";
import {validate} from "../../../middleware/validate.js";

const route = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**
 * create
 */
route.post(
    "/",
    upload.single("image"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER
    ]),
    validate(validation.create),
    controller.create
);

/**get */
route.get(
    "/:id?",
    controller.get
);

/**
 * update
 */
route.patch(
    "/:id",
    upload.single("image"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER
    ]),
    validate(validation.update),
    controller.update
);

export default route;

