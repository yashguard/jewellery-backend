import express from "express";
import {verifyToken} from "../../../middleware/verifyToken.js";
import controller from "../invoice/controller.js";
const route = express.Router();

/**
 * Get details
 */
route.get(
    "/details/:id?",
    verifyToken,
    controller.get
);

/**
 * Get
 */
route.get(
    "/get/:id?",
    verifyToken,
    controller.getInvoiceList
);

export default route;
