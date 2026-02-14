import express from "express";
import { verifyToken } from "../../../middleware/verifyToken.js";
import controller from "../dashboard/controller.js";
import { checkPermission } from "../../../middleware/role.js";
import { userRoleEnum } from "../../../config/enum.js";

const route = express.Router();

// -------------
// GET
// -------------

route.get("/search/:id?", controller.search);

route.get(
  "/:id?",
  verifyToken,
  checkPermission([
    userRoleEnum.ADMIN,
    userRoleEnum.MANAGER,
    userRoleEnum.PRODUCTMANAGER,
    userRoleEnum.SELLER,
    userRoleEnum.CONTENTEDITOR,
    userRoleEnum.CUSTOMERSERVICE,
  ]),
  controller.getByAdmin
);

// route.get(
//     "/manager/:id?",
//     verifyToken,
//     checkPermission([
//         userRoleEnum.MANAGER
//     ]),
//     controller.getByManager
// );

// route.get(
//     "/product-manager/:id?",
//     verifyToken,
//     checkPermission([
//         userRoleEnum.PRODUCTMANAGER
//     ]),
//     controller.getByProductManager
// );

// route.get(
//     "/seller/:id?",
//     verifyToken,
//     checkPermission([
//         userRoleEnum.SELLER
//     ]),
//     controller.getBySeller
// );

// route.get(
//     "/editor/:id?",
//     verifyToken,
//     checkPermission([
//         userRoleEnum.CONTENTEDITOR
//     ]),
//     controller.getByContentEditor
// );

// route.get(
//     "/service/:id?",
//     verifyToken,
//     checkPermission([
//         userRoleEnum.CUSTOMERSERVICE
//     ]),
//     controller.getByCustomerService
// );

export default route;
