import moment from "moment";
import { sendMail } from "../../helper/email.js";
import ReturnOrderModel from "./model.js";
import Services from "./service.js";
import OrderModel from "../orders/model.js";
import { orderStatusEnum } from "../../config/enum.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";
import AuthModel from "../authentication/model.js";
import mongoose from "mongoose";

class controller {
  /**
   * create
   */
  static create = async (req, res) => {
    try {
      const userId = req.user._id;
      const { orderId, reason, status } = req.body;

      const existingOrder = await OrderModel.findById(orderId);
      if (!existingOrder) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Order not found."),
        });
      }

      if (existingOrder && existingOrder.status === orderStatusEnum.DELIVERED) {
        const daysSinceDelivery = moment().diff(
          moment(existingOrder.deliveryDate),
          "days"
        );
        console.log(daysSinceDelivery);
        if (daysSinceDelivery > 15) {
          return errorResponse({
            res,
            statusCode: 400,
            error: Error("Order cannot be returned after 15 days of delivery."),
            funName: "returnOrder",
          });
        }

        const doc = { orderId, reason, status, user: userId };
        const result = await Services.create(doc);
        return successResponse({
          res,
          statusCode: 201,
          data: result,
          message: "Return order successfully processed.",
        });
      } else {
        return errorResponse({
          res,
          statusCode: 400,
          error: Error("Order status is not delivered."),
        });
      }
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "returnOrder.create",
      });
    }
  };

  /**
   * get
   */
  static get = async (req, res) => {
    try {
      const { id } = req.params;
      const { status, orderId, manageBy } = req.query;

      const filter = {};
      if (id) filter._id = new mongoose.Types.ObjectId(id);
      if (manageBy) filter.manageBy = new mongoose.Types.ObjectId(manageBy);
      if (orderId) filter.orderId = new mongoose.Types.ObjectId(orderId);
      if (status) filter.status = { $regex: status, $options: "i" };

      const pagination = paginationFun(req.query);
      let count, paginationData;

      count = await ReturnOrderModel.countDocuments(filter);
      const result = await Services.get(id, filter);

      paginationData = paginationDetails({
        limit: pagination.limit,
        page: req.query.page,
        totalItems: count,
      });

      return successResponse({
        res,
        statusCode: 200,
        pagination: paginationData,
        data: result,
        message: "Return order list retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "returnOrder.get",
      });
    }
  };

  /**
   * update
   */
  static update = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { status } = req.body;

      const returnOrder = await ReturnOrderModel.findById(id);
      if (!returnOrder) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Document not found."),
        });
      }

      // let name,email;
      // const existingOrder = await OrderModel.findById(returnOrder.orderId);
      // if (existingOrder.user) {
      //     const findUser = await AuthModel.findById(existingOrder.user)
      //     console.log(existingOrder.user, "user-------");
      //     email = findUser.email;
      //     name = findUser.username;
      // }
      // await sendMail({
      //     to: email,
      //     subject: `Your return order is ${ status }.`,
      //     dynamicData: {name,status},
      //     filename: "returnOrder.html",
      // });

      const doc = { status, manageBy: userId };
      const result = await Services.patch(id, doc);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Order updated successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "returnOrder.update" });
    }
  };
}

export default controller;
