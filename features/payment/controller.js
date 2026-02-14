import Razorpay from "razorpay";
import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";
import PaymentModel from "./model.js";
import AuthModel from "../authentication/model.js";
import OrderModel from "../orders/model.js";
import CartModel from "../cart/model.js";
import ProductModel from "../master/product/model.js";
import { config } from "../../config/config.js";
import { errorResponse, successResponse } from "../../helper/apiResponse.js";
import { paginationDetails, paginationFun } from "../../helper/common.js";
import { paymentStatusEnum, userRoleEnum } from "../../config/enum.js";
import Service from "../payment/service.js";
import { sendMail } from "../../helper/email.js";
import mongoose from "mongoose";
import ProductVariantModel from "../master/productVariants/model.js";

var instance = new Razorpay({
  key_id: config.razorpay.key_id,
  key_secret: config.razorpay.key_secret,
});

class controller {
  /**
   * create razorpay order
   */
  static createOrder = async (req, res) => {
    try {
      const { currency, orderId } = req.body;
      const existingOrder = await OrderModel.findById(orderId);
      if (!existingOrder) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Order not found."),
        });
      }

      const amount = existingOrder.totalAmount;
      const paymentOrder = await instance.orders.create({
        amount: amount * 100,
        currency: currency,
        receipt: uuidv4(),
        payment_capture: 1,
      });

      const doc = {
        razorpayOrderId: paymentOrder.id,
        currency: paymentOrder.currency,
        amount: paymentOrder.amount / 100,
        receipt: uuidv4(),
        customer: req.user._id,
        orderId,
      };

      await Service.createOrder(doc);
      return successResponse({
        res,
        statusCode: 201,
        message: "Payment successfully done.",
        data: doc,
      });
    } catch (error) {
      console.log(error);
      return errorResponse({
        res,
        error,
        message: error.description,
        funName: "payment.createOrder",
      });
    }
  };

  /**
   * get order
   */
  static getAllOrders = async (req, res) => {
    try {
      const { status, title, customer, search } = req.query;
      const { id } = req.params;
      let filter = {};

      if (id) filter._id = new mongoose.Types.ObjectId(id);
      if (status) filter.status = { $regex: new RegExp(`^${status}$`, "i") };
      if (title)
        filter.$or = [
          { razorpayOrderId: { $regex: title, $options: "i" } },
          { paymentId: { $regex: title, $options: "i" } },
        ];
      if (customer) filter.customer = new mongoose.Types.ObjectId(customer);
      if (search) {
        filter.$or = [
          { paymentId: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
        ];
      }

      const pagination = paginationFun(req.query);
      const count = await PaymentModel.countDocuments(filter);

      const result = await Service.getAllOrders(filter, pagination);
      let paginationData = paginationDetails({
        limit: pagination.limit,
        page: req.query.page,
        totalItems: count,
      });

      return successResponse({
        res,
        statusCode: 200,
        pagination: paginationData,
        data: result,
        message: "Orders fetched successfully",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "payment.getAllOrders",
      });
    }
  };

  /**
   * payment capture
   */
  static paymentCapture = async (req, res) => {
    try {
      const { razorpayOrderId, paymentId, signature, status } = req.body;

      if (razorpayOrderId && paymentId) {
        const signatureToMatch = CryptoJS.HmacSHA256(
          `${razorpayOrderId}|${paymentId}`,
          config.razorpay.key_secret
        ).toString();

        if (signatureToMatch === signature) {
          const existingPayment = await PaymentModel.findOne({
            razorpayOrderId: razorpayOrderId,
          });
          if (existingPayment && existingPayment.razorpayOrderId) {
            const existingOrder = await OrderModel.findById(
              existingPayment.orderId
            ).populate("items.product items.variant");
            await OrderModel.findByIdAndUpdate(
              existingOrder.id,
              { $set: { isPaid: true } },
              { new: true }
            );

            if (existingOrder) {
              for (const item of existingOrder.items) {
                let updatedProduct, updatedVariant;

                if (item.product && item.product._id) {
                  updatedProduct = await ProductModel.findByIdAndUpdate(
                    item.product._id,
                    {
                      $inc: {
                        quantity: -item.quantity,
                        sales: item.quantity,
                      },
                    },
                    { new: true }
                  );

                  const name = updatedProduct.name;
                  const quantity = updatedProduct.quantity;
                  const sku = updatedProduct.sku;

                  if (updatedProduct.quantity < 10) {
                    await sendMail({
                      to: updatedProduct.createdBy,
                      subject: `Low stock alert: ${updatedProduct.name}`,
                      dynamicData: { name, quantity, sku },
                      filename: "lowStock.html",
                    });
                  }

                  if (updatedProduct.quantity < 1) {
                    await ProductModel.findByIdAndUpdate(
                      item.product._id,
                      {
                        availability: false,
                      },
                      { new: true }
                    );
                  }
                }

                if (item.variant && item.variant._id) {
                  updatedVariant = await ProductVariantModel.findByIdAndUpdate(
                    item.variant._id,
                    {
                      $inc: {
                        quantity: -item.quantity,
                        sales: item.quantity,
                      },
                    },
                    { new: true }
                  );

                  const name = updatedVariant.name;
                  const quantity = updatedVariant.quantity;
                  const sku = updatedVariant.sku;

                  if (updatedVariant.quantity < 10) {
                    await sendMail({
                      to: updatedVariant,
                      subject: `Low stock alert: ${updatedVariant.name}`,
                      dynamicData: { name, quantity, sku },
                      filename: "lowStock.html",
                    });
                  }

                  if (updatedVariant.quantity < 1) {
                    await ProductVariantModel.findByIdAndUpdate(
                      item.variant._id,
                      {
                        availability: false,
                      },
                      { new: true }
                    );
                  }
                }
              }
              await CartModel.findByIdAndDelete(existingOrder.cart);
            }
          }

          await PaymentModel.findOneAndUpdate(
            { razorpayOrderId },
            { $set: { status: "completed", paymentId } },
            { new: true }
          );
          return successResponse({
            res,
            statusCode: 201,
            message: "Payment successfully captured.",
            data: {
              razorpayOrderId,
              paymentId,
            },
          });
        } else {
          await PaymentModel.findOneAndUpdate(
            { razorpayOrderId },
            { $set: { status: paymentStatusEnum.CANCELLED } },
            { new: true }
          );
          return errorResponse({
            res,
            statusCode: 400,
            error: Error("Payment failed. Please try again."),
          });
        }
      } else if (razorpayOrderId && !paymentId) {
        await PaymentModel.findOneAndUpdate(
          { razorpayOrderId },
          { $set: { status: paymentStatusEnum.FAILED } },
          { new: true }
        );
        return errorResponse({
          res,
          statusCode: 400,
          error: Error("Payment failed. Please try again."),
        });
      }
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "paymentCapture",
        message: error.message,
      });
    }
  };

  /**
   * refund
   */
  static refund = async (req, res) => {
    try {
      const userId = req.user._id;
      const { paymentId, amount, status } = req.body;

      if (paymentId) {
        const findStatus = await Service.findStatus(paymentId);
        if (findStatus.status === paymentStatusEnum.REFUNDED) {
          return errorResponse({
            res,
            statusCode: 400,
            error: Error("Payment already refunded."),
          });
        }
      }

      await instance.payments.refund(paymentId, { amount: amount });
      const result = await Service.refund(paymentId, userId, status);
      const existingUser = await AuthModel.findById(result.customer);

      if (status === paymentStatusEnum.REFUNDED) {
        // Find the order associated with the payment
        const existingPayment = await PaymentModel.findOne({ paymentId });
        if (existingPayment && existingPayment.orderId) {
          const existingOrder = await OrderModel.findById(
            existingPayment.orderId
          ).populate("items.product items.variant");

          if (existingOrder) {
            for (const item of existingOrder.items) {
              if (item.product && item.product._id) {
                await ProductModel.findByIdAndUpdate(item.product._id, {
                  $inc: {
                    quantity: item.quantity,
                    sales: -item.quantity,
                  },
                });
              }

              if (item.variant && item.variant._id) {
                await ProductVariantModel.findByIdAndUpdate(item.variant._id, {
                  $inc: {
                    quantity: item.quantity,
                    sales: -item.quantity,
                  },
                });
              }
            }
          }
        }

        let name = req.user.username;
        await sendMail({
          to: existingUser.email,
          subject: "Payment is refunded.",
          dynamicData: { amount, paymentId, name },
          filename: "refund.html",
        });
      }

      return successResponse({
        res,
        statusCode: 201,
        message: "Payment successfully refunded.",
        data: result,
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        message: error.message || error.description,
        funName: "payment.refund",
      });
    }
  };

  /**
   * Get refund information
   */
  static getAllRefunds = async (req, res) => {
    try {
      const { id } = req.params;

      let filter = {};
      if (id) filter._id = new mongoose.Types.ObjectId(id);
      const result = await PaymentModel.find(filter);

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Refunds retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "payment.getAllRefunds",
      });
    }
  };
}
export default controller;
