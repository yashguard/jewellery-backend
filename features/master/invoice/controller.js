import mongoose from "mongoose";
import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import {paginationDetails,paginationFun} from "../../../helper/common.js";
import OrderModel from "../../orders/model.js";

class controller {
    /**Get invoice */
    static get = async (req,res) => {
        try {
            const {orderId} = req.query;

            let filter = {};
            if (orderId) filter._id = new mongoose.Types.ObjectId(orderId);

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await OrderModel.countDocuments(filter);

            const result = await OrderModel.find(filter)
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
                message: "Invoice fetched successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "invoice.get"
            });
        }
    };
}

export default controller;
