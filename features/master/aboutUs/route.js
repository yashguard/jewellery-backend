import express from "express";
import {verifyToken} from "../../../middleware/verifyToken.js";
import controller from "../aboutUs/controller.js";
import multer from "multer";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";
import {validate} from "../../../middleware/validate.js";
import validation from "../aboutUs/validation.js";

const route = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**create team */
route.post(
    "/team",
    upload.single("file"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.createTeam),
    controller.createTeam
);

/**create score */
route.post(
    "/percentage",
    upload.single("file"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.createPercentage),
    controller.createPercentage
);

/**upload video */
route.post(
    "/video",
    upload.single("video"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.uploadVideo),
    controller.uploadVideo
);

/**get */
route.get(
    "/",
    controller.get
);

/**update */
route.patch(
    "/:id",
    upload.single("file"),
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    validate(validation.update),
    controller.update
);

/**delete */
route.delete(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.MANAGER
    ]),
    controller.delete
);

/**update scores/media */
route.patch(
    "/:id/update/:keyId",
    verifyToken,
    checkPermission([ userRoleEnum.ADMIN,userRoleEnum.SUB_ADMIN ]),
    validate(validation.updateKey),
    controller.updateKey
);

/**remove attribute/media*/
route.delete(
    "/:id/remove/:keyId",
    verifyToken,
    checkPermission([ userRoleEnum.ADMIN,userRoleEnum.SUB_ADMIN ]),
    controller.remove
);

export default route;
