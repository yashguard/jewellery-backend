import express from "express";
import {verifyToken} from "../../../middleware/verifyToken.js";
import controller from "../invoice/controller.js";
const route = express.Router();

/**
 * get invoice
 */
route.get(
    "/:id?",
    verifyToken,
    controller.get
);

export default route;
