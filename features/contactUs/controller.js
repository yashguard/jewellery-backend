import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import ContactUsModel from "../contactUs/model.js";
import {paginationDetails,paginationFun} from "../../helper/common.js";
import Services from "./service.js";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            const {name,email,phone,message} = req.body;
            const doc = {name,email,phone,message};
            const result = await Services.create(doc);
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "We've received your message. We'll be in touch shortly. We'll keep you informed via email. Thanks!"
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "contactUs.create"
            });
        }
    };

    /**
     * get
     */
    static get = async (req,res) => {
        try {
            const pagination = paginationFun(req.query);
            let count,paginationData;
            count = await ContactUsModel.countDocuments();
            paginationData = paginationDetails({
                limit: pagination.limit,
                page: req.query.page,
                totalItems: count,
            });
            const result = await Services.get(pagination);
            return successResponse({
                res,
                statusCode: 200,
                pagination: paginationData,
                data: result,
                message: "Successfully retrieved the list of contacts."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "contactUs.get"
            });
        }
    };

    /**
     * update status
     */
    static updateStatus = async (req,res) => {
        try {
            const {status} = req.body;
            const {id} = req.params;

            const existingContact = await Services.existingContact(id);
            if (!existingContact) {
                return errorResponse({
                    res,
                    error: Error("Contact not found."),
                    statusCode: 404
                });
            }
            const result = await Services.update(id,status);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Contact status is updated."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "contactUs.updateStatus"
            });
        }
    };

    /**
     * delete
     */
    static deleteContact = async (req,res) => {
        try {
            const {id} = req.params;
            const existingContact = await Services.existingContact(id);
            if (!existingContact) {
                return errorResponse({
                    res,
                    error: Error("Contact not found."),
                    statusCode: 404
                });
            }
            await Services.deleteContact(id);
            return successResponse({
                res,
                statusCode: 200,
                message: "Contact deleted successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "contactUs.delete"
            });
        }
    };
}
export default controller;
