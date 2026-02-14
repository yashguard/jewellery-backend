import express from "express";
import controller from "../wishlist/controller.js";
import validation from "../wishlist/validation.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import {validate} from "../../middleware/validate.js";
import {checkPermission} from "../../middleware/role.js";
import {userRoleEnum} from "../../config/enum.js";

const route = express.Router();

/**add-remove */
route.post(
    "/:id",
    verifyToken,
    checkPermission([
        userRoleEnum.CUSTOMER
    ]),
    validate(validation.create),
    controller.create
);

/**get */
route.get(
    "/:id?",
    verifyToken,
    controller.get
);

/**move to cart */
route.post(
    "/:id/cart/:productId",
    verifyToken,
    checkPermission([
        userRoleEnum.CUSTOMER
    ]),
    controller.moveToCart
);

export default route;
