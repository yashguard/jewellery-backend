import Razorpay from "razorpay";
import CryptoJS from "crypto-js";
import {config} from "../../config/config.js";
import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import {paginationDetails,paginationFun} from "../../helper/common.js";
import PaymentModel from "./model.js";
import {paymentStatusEnum,userRoleEnum} from "../../config/enum.js";
import {v4 as uuidv4} from 'uuid';
import Service from "../payment/service.js";
import {sendMail} from "../../helper/email.js";
import AuthModel from "../authentication/model.js";
import OrderModel from "../orders/model.js";
import CartModel from "../cart/model.js";
import ProductModel from "../master/product/model.js";

var instance = new Razorpay({
    key_id: config.razorpay.key_id,
    key_secret: config.razorpay.key_secret
});

class controller {
    /**
     * create razorpay order
     */
    static createOrder = async (req,res) => {
        try {
            const {currency,orderId} = req.body;
            const existingOrder = await OrderModel.findById(orderId);
            if (!existingOrder) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Order not found.")
                });
            }

            const amount = existingOrder.totalAmount;
            const paymentOrder = await instance.orders.create({
                amount: amount * 100,
                currency: currency,
                receipt: uuidv4(),
                payment_capture: 1
            });

            const doc = {
                razorpayOrderId: paymentOrder.id,
                currency: paymentOrder.currency,
                amount: paymentOrder.amount / 100,
                receipt: uuidv4(),
                customer: req.user._id,
                orderId
            };

            await Service.createOrder(doc);
            return successResponse({
                res,
                statusCode: 201,
                message: "Payment successfully done.",
                data: doc
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                message: error.description,
                funName: "payment.createOrder"
            });
        }
    };

    /**
     * get order
     */
    static getAllOrders = async (req,res) => {
        try {
            const {status,title} = req.query;
            const {id} = req.params;
            let filter = {};

            if (id) filter._id = id;
            if (status) filter.status = status;
            if (title)
                filter.$or = [
                    {razorpayOrderId: {$regex: title,$options: "i"}},
                    {paymentId: {$regex: title,$options: "i"}},
                ];
            if (req.user.role !== userRoleEnum.ADMIN) filter.user = req.user._id;

            const pagination = paginationFun(req.query);
            const count = await PaymentModel.countDocuments(filter);

            const result = await Service.getAllOrders(filter,pagination);
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
    static paymentCapture = async (req,res) => {
        try {
            const {razorpayOrderId,paymentId,signature,status} = req.body;

            if (razorpayOrderId && paymentId) {
                const signatureToMatch = CryptoJS.HmacSHA256(
                    `${ razorpayOrderId }|${ paymentId }`,
                    config.razorpay.key_secret
                ).toString();

                if (signatureToMatch === signature) {
                    const existingPayment = await PaymentModel.findOne({paymentId: paymentId});
                    if (existingPayment && existingPayment.orderId) {
                        const existingOrder = await OrderModel.findById(existingPayment.orderId).populate('items.product items.variant');
                        await OrderModel.findByIdAndUpdate(existingOrder.id,{$set: {status: "processing"}},{new: true});
                        if (existingOrder) {
                            for (const item of existingOrder.items) {
                                if (item.product && item.product._id) {
                                    await ProductModel.findByIdAndUpdate(item.product._id,{
                                        $inc: {
                                            quantity: -item.quantity,
                                            sales: item.quantity
                                        }
                                    });
                                }

                                if (item.variant && item.variant._id) {
                                    await VariantModel.findByIdAndUpdate(item.variant._id,{
                                        $inc: {
                                            quantity: -item.quantity,
                                            sales: item.quantity
                                        }
                                    });
                                }
                            }
                            await CartModel.findByIdAndDelete(existingOrder.cart);
                        }
                    }
                    await PaymentModel.findOneAndUpdate({razorpayOrderId},{$set: {status: "completed"}});
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
                    throw new Error("Payment unsuccessful.");
                }
            } else {
                await PaymentModel.findOneAndUpdate({razorpayOrderId},{$set: {status}});
                throw new Error("Payment unsuccessful, please try again!");
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
    static refund = async (req,res) => {
        try {
            const userId = req.user._id;
            const {paymentId,amount,status} = req.body;
            await instance.payments.refund(paymentId,{
                amount: amount
            });

            const result = await Service.refund(paymentId,userId,status);
            const existingUser = await AuthModel.findById(result.customer);

            if (status === paymentStatusEnum.REFUNDED) {
                // Find the order associated with the payment
                const existingPayment = await PaymentModel.findOne({paymentId});
                if (existingPayment && existingPayment.orderId) {
                    const existingOrder = await OrderModel.findById(existingPayment.orderId).populate('items.product items.variant');

                    if (existingOrder) {
                        for (const item of existingOrder.items) {
                            if (item.product && item.product._id) {
                                await ProductModel.findByIdAndUpdate(item.product._id,{
                                    $inc: {
                                        quantity: item.quantity,
                                        sales: -item.quantity
                                    }
                                });
                            }

                            if (item.variant && item.variant._id) {
                                await VariantModel.findByIdAndUpdate(item.variant._id,{
                                    $inc: {
                                        quantity: item.quantity,
                                        sales: -item.quantity
                                    }
                                });
                            }
                        }
                    }
                }

                let name = req.user.username;
                await sendMail({
                    to: existingUser.email,
                    subject: "Payment is refunded.",
                    dynamicData: {amount,paymentId,name},
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

}
export default controller;
