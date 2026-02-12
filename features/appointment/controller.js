import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import {paginationDetails,paginationFun} from "../../helper/common.js";
import {sendMail} from "../../helper/email.js";
import Service from "./service.js";

class controller {
    /**
     * create appointment
     */
    static create = async (req,res) => {
        try {
            const {name,email,phone,date,time,message} = req.body;
            const doc = {name,email,phone,date,time,message};
            const result = await Service.create(doc);
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
                funName: "appointment.create"
            });
        }
    };

    /**
     * get appointment
     */
    static get = async (req,res) => {
        try {
            const {id} = req.params;
            const {status} = req.query;

            const filter = {};

            if (id) filter._id = id;
            if (status) filter.status = {$regex: status,$options: "i"};

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await Service.countDoc(filter);
            const result = await Service.get(filter,pagination);
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
                message: "Appointment list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "appointment.get"
            });
        }
    };

    /**
     * update appointment
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {date,time,status} = req.body;
            const doc = {date,time,status};

            const existingAppointment = await Service.existingApp(id);
            const name = existingAppointment.name;

            await sendMail({
                to: existingAppointment.email,
                subject: `Your appointment is ${ status }.`,
                dynamicData: {name,date,time,status},
                filename: "appointment.html",
            });

            const result = await Service.update(id,doc);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Appointment is updated."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "appointment.update"
            });
        }
    };
}
export default controller;
