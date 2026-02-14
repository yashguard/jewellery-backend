import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import {paginationDetails,paginationFun} from "../../../helper/common.js";
import Service from "../invoice/service.js";

class controller {
    /**Get */
    static get = async (req,res) => {
        try {
            const {orderId} = req.query;
            let filter = {};
            if (orderId) filter.orderId = {$regex: new RegExp(`^${ orderId }$`,'i')};
            const result = await Service.get(filter);
            return successResponse({
                res,
                statusCode: 200,
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

    /**
     * Get List
     */
    static getInvoiceList = async (req,res) => {
        try {
            const {orderId} = req.query;
            let filter = {};
            if (orderId) filter.orderId = {$regex: new RegExp(`^${ orderId }$`,'i')};

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await Service.getCount(filter);
            const result = await Service.getInvoiceList(filter,pagination);

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
                funName: "invoice.getInvoiceList"
            });
        }
    };
}

export default controller;
