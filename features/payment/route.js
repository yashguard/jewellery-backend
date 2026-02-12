import express from "express";
import controller from "../payment/controller.js";
import validation from "../payment/validation.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import {checkPermission} from "../../middleware/role.js";
import {validate} from "../../middleware/validate.js";
import {userRoleEnum} from "../../config/enum.js";

const route = express.Router();

/**create razporpay orders */
route.post(
    "/orders",
    verifyToken,
    checkPermission([
        userRoleEnum.CUSTOMER
    ]),
    validate(validation.order),
    controller.createOrder
);

/**get orders */
route.get(
    "/orders/:id?",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.SELLER,
        userRoleEnum.CUSTOMER,
        userRoleEnum.PRODUCTMANAGER,
        userRoleEnum.MANAGER
    ]),
    controller.getAllOrders
);

/**payment capture  */
route.post(
    "/",
    verifyToken,
    checkPermission([ userRoleEnum.CUSTOMER ]),
    validate(validation.payment),
    controller.paymentCapture
);

/**refund */
route.patch(
    "/refund",
    verifyToken,
    checkPermission([
        userRoleEnum.ADMIN,
        userRoleEnum.SELLER
    ]),
    validate(validation.refund),
    controller.refund
);

export default route;
