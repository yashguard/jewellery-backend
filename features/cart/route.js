import express from "express";
import controller from "../cart/controller.js";
import validation from "../cart/validation.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import {validate} from "../../middleware/validate.js";

const route = express.Router();

/**create cart */
route.post(
    "/add/:id",
    verifyToken,
    validate(validation.create),
    controller.create
);

/**remove product/variant */
route.post(
    "/:id/remove/:productId",
    verifyToken,
    controller.remove
);

/**move to wishlist */
route.post(
    "/:id/product/:productId/wishlist",
    verifyToken,
    controller.moveToWishlist
);

/**get cart */
route.get(
    "/:id?",
    verifyToken,
    controller.get
);

/**update cart */
route.patch(
    "/:id/product/:productId",
    verifyToken,
    validate(validation.update),
    controller.update
);

/**apply coupon */
route.post(
    "/:id/coupon",
    verifyToken,
    validate(validation.coupon),
    controller.applyCoupon
);

/**remove coupon */
route.post(
    "/:id/remove-coupon",
    verifyToken,
    controller.removeCoupon
);

/**update cart */
route.patch(
    "/:id/price",
    verifyToken,
    controller.updatePrice
);

export default route;
