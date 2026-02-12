import {discountTypeEnum} from "../../../config/enum.js";
import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import CouponModel from "./model.js";

class controller {
    static create = async (req,res) => {
        try {
            const {code,minimumSpend,description,discountType,expiredTime} = req.body;
            let {validAmount,savedAmount,discountValue} = req.body;

            if (discountType === discountTypeEnum.AMOUNT) {
                validAmount -= discountValue;
                savedAmount = discountValue;
            } else if (discountType === discountTypeEnum.PERCENTAGE) {
                const discount = (validAmount * discountValue) / 100;
                validAmount -= discount;
                savedAmount = discount;
            }

            const result = await CouponModel.create({code,minimumSpend,description,discountType,expiredTime,validAmount,savedAmount,discountValue});
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

    static get = async (req,res) => {
        try {
            const {id} = req.params;

            let filter = {};
            if (id) filter._id = id;

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

    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {minimumSpend,description,expiredTime} = req.body;

            const coupon = await CouponModel.findById(id);
            if (!coupon) {
                return errorResponse({
                    res,statusCode: 404,error: Error("Coupon not found.")
                });
            }

            const result = await CouponModel.findByIdAndUpdate(id,
                {$set: {minimumSpend,description,expiredTime}},
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
