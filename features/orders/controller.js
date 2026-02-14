import mongoose from "mongoose";
import moment from "moment";
import Service from "./service.js";
import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import {orderStatusEnum} from "../../config/enum.js";
import {sendMail} from "../../helper/email.js";
import OrderModel from "./model.js";
import AuthModel from "../authentication/model.js";
import {paginationDetails,paginationFun} from "../../helper/common.js";

class controller {
    /**
     * update order
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {
                name,phoneNumber,email,addressLine1,addressLine2,postalCode,city,sameAsShippingAddress,
                status,addressType,shippingAddress,billingAddress,state
            } = req.body;

            const existingOrder = await OrderModel.findById(id);
            if (!existingOrder) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("Order not found.")
                });
            }

            let expectedDeliveryDate = moment().add(10,'days');
            if (!sameAsShippingAddress && !billingAddress) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: new Error("Billing address is required.")
                });
            }

            let finalBillingAddress = billingAddress;
            if (sameAsShippingAddress) {
                finalBillingAddress = shippingAddress;
            }

            if (existingOrder.totalAmount > 500000) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: new Error("The order amount should not be more than 5 lakh.")
                });
            }
            const doc = {
                name,phoneNumber,email,addressLine1,addressLine2,postalCode,city,sameAsShippingAddress,
                status,addressType,shippingAddress,billingAddress: finalBillingAddress,expectedDeliveryDate,state
            };

            const result = await Service.create(id,doc);
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Your order has been created successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "order.create"
            });
        }
    };

    /**
     * Get order
     */
    static getOrder = async (req,res) => {
        try {
            const {id} = req.params;
            const {user,orderId,search,status,createdAt,cart} = req.query;
            const pagination = paginationFun(req.query);
            let count;

            const filter = {};
            if (id) filter._id = new mongoose.Types.ObjectId(id);;
            if (user) filter.user = new mongoose.Types.ObjectId(user);
            if (cart) filter.cart = new mongoose.Types.ObjectId(cart);
            if (orderId) filter.orderId = {$regex: new RegExp(`^${ orderId }$`,'i')};
            if (status) filter.status = {$regex: new RegExp(`^${ status }$`,'i')};
            if (createdAt) filter.createdAt = {$regex: new RegExp(`^${ createdAt }$`,'i')};

            if (search) {
                filter.$or = [
                    {orderId: {$regex: search,$options: "i"}},
                    {description: {$regex: search,$options: "i"}},
                    {type: {$regex: search,$options: "i"}},
                    {status: {$regex: search,$options: "i"}},
                ];
            };

            count = await OrderModel.countDocuments(filter);
            const result = await Service.get(filter,pagination);
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
                message: "Order retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "order.getOrder"
            });
        }
    };

    /**
     * update status
     */
    static updateStatus = async (req,res) => {
        try {
            const userId = req.user._id;
            const {id} = req.params;
            const {status,isPaid} = req.body;

            const existingOrder = await Service.existingOrder(id);
            if (!existingOrder) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Order not found.")
                });
            }

            let deliveryDate;

            const date = existingOrder.createdAt;
            const day = String(date.getDate()).padStart(2,'0');
            const month = String(date.getMonth() + 1).padStart(2,'0');
            const year = date.getFullYear();
            const convertDate = `${ day }/${ month }/${ year }`;
            const findUser = await AuthModel.findById(existingOrder.user);
            const name = findUser.username;
            const order = existingOrder.orderId;

            if (status === orderStatusEnum.DELIVERED) {
                await sendMail({
                    to: existingOrder.shippingAddress.email && existingOrder.billingAddress.email,
                    subject: `Your order is ${ status }.`,
                    dynamicData: {name,order,convertDate},
                    filename: "order.html",
                });
                deliveryDate = Date.now();
            }

            const doc = {status,deliveryDate,sellBy: userId,isPaid};
            const result = await Service.updateStatus(id,doc);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Order status updated successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "order.updateStatus"
            });
        }
    };

    /**
     * Add payment method
     */
    static addPaymentMethod = async (req,res) => {
        try {
            const {id} = req.params;
            const {paymentMethod} = req.body;

            const existingOrder = await OrderModel.findById(id);
            if (!existingOrder) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Order not found.")
                });
            }

            const result = await OrderModel.findByIdAndUpdate(id,{$set: {paymentMethod}},{new: true});
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Payment method added successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "order.addPaymentMethod"
            });
        }
    };
}

export default controller;
