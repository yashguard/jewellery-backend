import express from "express";
import multer from "multer";
import controller from "./controller.js";
import {verifyToken} from "../../../middleware/verifyToken.js";
import validation from "./validation.js";
import {checkPermission} from "../../../middleware/role.js";
import {userRoleEnum} from "../../../config/enum.js";
import {validate} from "../../../middleware/validate.js";

const route = express.Router();

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

/**create blog */
route.post(
  "/",
  upload.single("file"),
  verifyToken,
  checkPermission([
    userRoleEnum.ADMIN,
    userRoleEnum.CONTENTEDITOR
  ]),
  validate(validation.create),
  controller.create
);

/**get blog */
route.get(
  "/get/:id?",
  controller.get
);

/**get blog details */
route.get(
  "/details/:id?",
  controller.getDetails
);

/**update blog */
route.patch(
  "/:id",
  upload.single("file"),
  verifyToken,
  checkPermission([
    userRoleEnum.ADMIN,
    userRoleEnum.CONTENTEDITOR
  ]),
  validate(validation.update),
  controller.patch
);

/**delete blog */
route.delete(
  "/:id",
  verifyToken,
  checkPermission([
    userRoleEnum.ADMIN,
    userRoleEnum.CONTENTEDITOR
  ]),
  controller.deleteBlog
);

export default route;
