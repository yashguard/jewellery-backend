import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import {paginationDetails,paginationFun} from "../../helper/common.js";
import {sendMail} from "../../helper/email.js";
import VideoCallModel from "./model.js";
import Services from "./service.js";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            const {language,name,email,phone,date,time,message} = req.body;
            const doc = {language,name,email,phone,date,time,message};
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
                funName: "videoCall.create",
            });
        }
    };

    /**
     * get
     */
    static get = async (req,res) => {
        try {
            const {id} = req.params;
            const {type,date,time,status,email} = req.query;

            const filter = {};
            if (id) filter._id = id;
            if (type) filter.type = {$regex: type,$options: "i"};
            if (date) filter.date = {$regex: date,$options: "i"};
            if (time) filter.time = {$regex: time,$options: "i"};
            if (status) filter.status = {$regex: status,$options: "i"};
            if (email) filter.email = {$regex: email,$options: "i"};

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await VideoCallModel.countDocuments(filter);
            const result = await Services.get(id,filter);

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
                message: "Videocall list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "videoCall.get",
            });
        }
    };

    /**
     * update
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {date,time,status} = req.body;

            const videoCall = await VideoCallModel.findById(id);
            if (!videoCall) {
                return errorResponse({res,statusCode: 404,error: Error("Document not found.")});
            }

            let name = videoCall.name;
            await sendMail({
                to: videoCall.email,
                subject: `Your appointment is ${ status }.`,
                dynamicData: {name,date,time,status},
                filename: "videocall.html",
            });

            const doc = {date,time,status};
            const result = await Services.patch(id,doc);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Document updated successfully."
            });
        } catch (error) {
            return errorResponse({res,error,funName: "videoCall.update"});
        }
    };
}

export default controller;
