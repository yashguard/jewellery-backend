import Express from "express";
import multer from "multer";
import controller from "../banner/controller.js";
import validation from "../banner/validation.js";
import {verifyToken} from "../../../middleware/verifyToken.js";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";
import {validate} from "../../../middleware/validate.js";

const route = Express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**create banner */
route.post(
    "/",
    upload.array("files"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.CONTENTEDITOR
    ]),
    validate(validation.create),
    controller.create
);

/**get banner */
route.get(
    "/",
    controller.get
);

/**update banner */
route.patch(
    "/:id",
    upload.array("files"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.CONTENTEDITOR
    ]),
    validate(validation.update),
    controller.update
);

/**delete banner */
route.delete(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.CONTENTEDITOR
    ]),
    controller.deleteBanner
);

/**delete single image */
route.delete(
    "/:id/file/:fileId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.CONTENTEDITOR
    ]),
    controller.deleteSingleFile
);

export default route;
