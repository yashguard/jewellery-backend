import mongoose from "mongoose";
import moment from "moment";
import Service from "./service.js";
import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import {orderStatusEnum} from "../../config/enum.js";
import {sendMail} from "../../helper/email.js";
import OrderModel from "./model.js";

class controller {
    /**
     * update order
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {
                firstName,lastName,phoneNumber,email,addressLine1,addressLine2,postalCode,city,sameAsShippingAddress,
                status,addressType,shippingAddress,billingAddress,state
            } = req.body;

            const existingOrder = await OrderModel.findById(id);
            if (!existingOrder) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Order not found.")
                });
            }

            let expectedDeliveryDate = moment().add(4,'days');
            if (sameAsShippingAddress === false && !billingAddress) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: Error("Billing address is required.")
                });
            }

            const doc = {
                firstName,lastName,phoneNumber,email,addressLine1,addressLine2,postalCode,city,sameAsShippingAddress,
                status,addressType,shippingAddress,billingAddress,expectedDeliveryDate,status,state
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
            const {user,orderId} = req.query;

            const filter = {};
            if (id) filter._id = id;
            if (user) filter.user = new mongoose.Types.ObjectId(user);
            if (orderId) filter.orderId = orderId;

            const result = await Service.get(filter);
            return successResponse({
                res,
                statusCode: 200,
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
            const {id} = req.params;
            const {status} = req.body;

            const existingOrder = await Service.existingOrder(id);
            if (!existingOrder) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Order not found.")
                });
            }

            let order = existingOrder.orderId;
            let name = existingOrder.firstName;
            let invoiceId = existingOrder.invoiceId;
            let date = existingOrder.date;
            let addressLine1 = existingOrder.shippingAddress.addressLine1;
            let city = existingOrder.shippingAddress.city;
            let state = existingOrder.shippingAddress.state;
            let phone = existingOrder.shippingAddress.phoneNumber;
            let email = existingOrder.shippingAddress.email;
            let items = existingOrder.items;
            let subTotal = existingOrder.subTotal;
            let taxValue = existingOrder.taxValue;
            let totalCost = existingOrder.totalCost;

            let deliveryDate;
            if (status === orderStatusEnum.DELIVERED) {
                await sendMail({
                    to: existingOrder.shippingAddress.email,
                    subject: `Your order is ${ status }.`,
                    dynamicData: {name,order},
                    filename: "order.html",
                });
                deliveryDate = Date.now();

                await sendMail({
                    to: existingOrder.shippingAddress.email,
                    subject: `Invoice`,
                    dynamicData: {invoiceId,date,order,addressLine1,city,state,phone,email,items,subTotal,taxValue,totalCost},
                    filename: "invoice.html",
                });
            }

            const doc = {status,deliveryDate};
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
}

export default controller;
