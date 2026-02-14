import {successResponse} from "../../../helper/apiResponse.js";
import CommentModel from "../../comment/model.js";
import BlogModel from "./model.js";

class Services {
    /**
     * create
     */
    static create = async (doc) => {
        return BlogModel.create(doc);
    };

    /**
     * get
     */
    static get = async (filter,pagination) => {
        return BlogModel.find(filter)
            .select("-html -slug")
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort({createdAt: -1});
    };

    /**
     * get details
     */
    static getDetails = async (filter,pagination) => {
        return BlogModel.find(filter)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort({createdAt: -1});
    };

    /**
     * update
     */
    static patch = async (id,doc) => {
        return BlogModel.findByIdAndUpdate(id,{$set: doc},{new: true});
    };

    /**
     * delete
     */
    static deleteBlog = async (res,id) => {
        await CommentModel.deleteMany({blog: id});
        await BlogModel.findByIdAndDelete(id);
        return successResponse({
            res,
            statusCode: 200,
            message: "Blog is deleted."
        });
    };
}
export default Services;
