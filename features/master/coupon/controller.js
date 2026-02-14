import mongoose from "mongoose";
import {discountTypeEnum} from "../../../config/enum.js";
import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import CouponModel from "./model.js";
import {paginationDetails,paginationFun} from "../../../helper/common.js";

class controller {
    /**
     * Create
     */
    static create = async (req,res) => {
        try {
            const userId = req.user._id;
            const {code,description,discountType,endDate,isActive} = req.body;
            let {validAmount,savedAmount,discountValue} = req.body;

            const existingCode = await CouponModel.findOne({code: code});
            if (existingCode) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: Error("This code is already in use by another coupon.")
                });
            }

            if (discountType === discountTypeEnum.AMOUNT) {
                savedAmount = discountValue;
            } else if (discountType === discountTypeEnum.PERCENTAGE) {
                const discount = (validAmount * discountValue) / 100;
                savedAmount = discount;
            }

            const result = await CouponModel.create({code,description,discountType,endDate,isActive,validAmount,savedAmount,discountValue,createdBy: userId});
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Coupon is created."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "coupon.create"
            });
        }
    };

    /**
     * Get
     */
    static get = async (req,res) => {
        try {
            let filter = {};
            const {code} = req.query;
            filter.isActive = true;
            if (code) filter.code = {$regex: code,$options: "i"};
            const result = await CouponModel.find(filter);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Coupon list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "coupon.get"
            });
        }
    };

    /**
     * Get by admin
     */
    static getByAdmin = async (req,res) => {
        try {
            const {id} = req.params;
            const {code,isActive} = req.query;

            let filter = {};
            if (id) filter._id = new mongoose.Types.ObjectId(id);
            if (code) filter.code = {$regex: code,$options: "i"};
            if (isActive !== undefined) filter.isActive = isActive === "true";

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await CouponModel.countDocuments(filter);
            const result = await CouponModel.find(filter)
                .skip(pagination.skip)
                .limit(pagination.limit)
                .sort({createdAt: -1});
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
                message: "Coupon list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "coupon.get"
            });
        }
    };

    /**
     * Update
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const userId = req.user._id;
            const {description,endDate,isActive} = req.body;

            const coupon = await CouponModel.findById(id);
            if (!coupon) {
                return errorResponse({
                    res,statusCode: 404,error: Error("Coupon not found.")
                });
            }

            const result = await CouponModel.findByIdAndUpdate(id,
                {$set: {description,endDate,isActive,createdBy: userId}},
                {new: true}
            );
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Coupon updated successfully."
            });
        } catch (error) {
            return errorResponse({res,error});
        }
    };

    /**
     * Delete
     */
    static delete = async (req,res) => {
        try {
            const {id} = req.params;
            const find = await CouponModel.findById(id);
            if (!find) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Coupon not found.")
                });
            }
            await CouponModel.findByIdAndDelete(id);
            return successResponse({
                res,
                statusCode: 200,
                message: "Coupon is deleted."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "coupon.delete"
            });
        }
    };
}

export default controller;
