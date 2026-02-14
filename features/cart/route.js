import express from "express";
import controller from "../cart/controller.js";
import validation from "../cart/validation.js";
import { verifyToken } from "../../middleware/verifyToken.js";
import { validate } from "../../middleware/validate.js";
import { userRoleEnum } from "../../config/enum.js";
import { checkPermission } from "../../middleware/role.js";

const route = express.Router();

/**create cart */
route.post(
  "/add/:id",
  verifyToken,
  checkPermission([userRoleEnum.CUSTOMER]),
  validate(validation.create),
  controller.create
);

/**remove product/variant */
route.post(
  "/:id/remove/:productId",
  verifyToken,
  checkPermission([userRoleEnum.CUSTOMER]),
  controller.remove
);

/**move to wishlist */
route.post(
  "/:id/product/:productId/wishlist",
  verifyToken,
  checkPermission([userRoleEnum.CUSTOMER]),
  controller.moveToWishlist
);

/**get cart */
route.get("/:id?", verifyToken, controller.get);

/**update cart */
route.patch(
  "/:id/product/:productId",
  verifyToken,
  checkPermission([userRoleEnum.CUSTOMER]),
  validate(validation.update),
  controller.update
);

/**apply coupon */
route.post(
  "/:id/coupon",
  verifyToken,
  checkPermission([userRoleEnum.CUSTOMER]),
  validate(validation.coupon),
  controller.applyCoupon
);

/**remove coupon */
route.post(
  "/:id/remove-coupon",
  verifyToken,
  checkPermission([userRoleEnum.CUSTOMER]),
  controller.removeCoupon
);

/**update cart */
route.patch(
  "/:id/price",
  verifyToken,
  checkPermission([userRoleEnum.CUSTOMER]),
  controller.updatePrice
);

export default route;
