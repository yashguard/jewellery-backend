import express from "express";
import {verifyToken} from "../../../middleware/verifyToken.js";
import controller from "../home/controller.js";
import validation from "../home/validation.js";
import {validate} from "../../../middleware/validate.js";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";
import multer from "multer";

const route = express.Router();
const storage = multer.memoryStorage();
const upload = multer({storage: storage});

// ---------------
// POST Methods
// ---------------
route.post(
    "/",
    upload.array("file"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.create),
    controller.create
);

// ---------------
// GET Methods
// ---------------
route.get(
    "/:id?",
    controller.get
);

// ---------------
// PATCH Methods
// ---------------
route.patch(
    "/:id",
    upload.array("file"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.update),
    controller.update
);

route.patch(
    "/:id/doc/:docId",
    upload.single("file"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.updateSingleRecord),
    controller.updateSingleRecord
);

// ---------------
// DELETE Methods
// ---------------
route.delete(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    controller.delete
);

route.delete(
    "/:id/file/:fileId",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    controller.deleteSingleFile
);

export default route;
