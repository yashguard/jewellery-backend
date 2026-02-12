import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import FaqModel from "./model.js";
import Services from "./service.js";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            const {question,answer,type} = req.body;
            const doc = {question,answer,type};
            const result = await Services.create(doc);
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Faq is created successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "faq.create"
            });
        }
    };

    /**
     * get
     */
    static get = async (req,res) => {
        try {
            const filter = {};
            const {id} = req.params;
            const {type} = req.query;

            if (id) filter.id = id;
            if (type) filter.type = {$regex: type,$options: "i"};

            const result = await Services.get(filter);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Faq list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "faq.get"
            });
        }
    };

    /**
     * update
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {question,answer,type} = req.body;

            const find = await FaqModel.findById(id);
            if (!find) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Faq not found.")
                });
            }
            const doc = {question,answer,type};
            const result = await Services.update(id,doc);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Faq is updated."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "faq.update"
            });
        }
    };

    /**
     * delete
     */
    static deleteFaq = async (req,res) => {
        try {
            const {id} = req.params;

            const existingFaq = await FaqModel.findById(id);
            if (!existingFaq) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Faq not found.")
                });
            }

            await Services.deleteFaq(id);

            return successResponse({
                res,
                statusCode: 200,
                message: "Faq is deleted."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "faq.delete"
            });
        }
    };
}
export default controller;
