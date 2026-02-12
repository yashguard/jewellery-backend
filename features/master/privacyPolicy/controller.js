import PrivacyPolicyModel from "../privacyPolicy/model.js";
import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import Service from "../privacyPolicy/service.js";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            const {title,longDescription,shortDescription,type} = req.body;
            const doc = {title,longDescription,shortDescription,type};
            const result = await Service.create(doc);
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Document created successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "privacyPolicy.create"
            });
        }
    };

    /**
     * get
     */
    static get = async (req,res) => {
        try {
            const {id} = req.params;
            const {type} = req.query;

            let filter = {};
            if (id) filter._id = id;
            if (type) filter.type = {$regex: type,$options: "i"};

            const result = await Service.get(filter);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Documents retrieved successfully."
            });

        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "privacyPolicy.get"
            });
        }
    };

    /**
     * update
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {title,longDescription,shortDescription} = req.body;

            const find = await Service.findById(id);
            if (!find) {
                return errorResponse({res,statusCode: 404,error: Error("Document not found.")});
            }

            const updateFields = {title,longDescription,shortDescription};
            const result = await Service.update(id,updateFields);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Document is updated.",
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "privacyPolicy.update"
            });
        }
    };

    /**
     * delete
     */
    static delete = async (req,res) => {
        try {
            const {id} = req.params;

            const findDoc = await Service.findById(id);
            if (!findDoc) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Document not found.")
                });
            }

            await Service.delete(id);
            return successResponse({
                res,
                statusCode: 200,
                message: "Document deleted successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "privacyPolicy.delete"
            });
        }
    };
}

export default controller;
