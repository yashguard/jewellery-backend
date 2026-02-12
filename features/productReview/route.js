import express from "express";
import controller from "../productReview/controller.js";
import validation from "../productReview/validation.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import multer from "multer";
import {validate} from "../../middleware/validate.js";
import {checkPermission} from "../../middleware/role.js";
import {userRoleEnum} from "../../config/enum.js";
const route = express.Router();
const upload = multer().array("files");

/**create */
route.post(
    "/",
    upload,
    verifyToken,
    validate(validation.create),
    controller.create
);

/**get */
route.get(
    "/:id?",
    controller.get
);

/**delete */
route.delete(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.PRODUCTMANAGER
    ]),
    controller.deleteProductReview
);

export default route;
