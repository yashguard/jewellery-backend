import multer from "multer";
import express from "express";
import {verifyToken} from "../../../middleware/verifyToken.js";
import controller from "../category/controller.js";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";
import {validate} from "../../../middleware/validate.js";
import validation from "../category/validation.js";

const route = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**create category */
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

/**get category */
route.get(
    "/:id?",
    controller.get
);

/**update category */
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
