import express from "express";
import controller from "../enums/controller.js";

const route = express.Router();

/**
 * get enums
 */
route.get(
    "/",
    controller.getEnums
);

export default route;
