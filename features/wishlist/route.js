import express from "express";
import controller from "../wishlist/controller.js";
import validation from "../wishlist/validation.js";
import {verifyToken} from "../../middleware/verifyToken.js";
import {validate} from "../../middleware/validate.js";

const route = express.Router();

/**add-remove */
route.post(
    "/:id",
    verifyToken,
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
    "/:id/cart",
    verifyToken,
    controller.moveToCart
);

export default route;
