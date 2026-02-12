import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import {paginationDetails,paginationFun} from "../../helper/common.js";
import BlogModel from "../master/blog/model.js";
import CommentModel from "../comment/model.js";

class controller {
    /**
     * create-comment
     */
    static create = async (req,res) => {
        try {
            const {blog,name,email,comment} = req.body;
            const find = await BlogModel.findById(blog);
            if (!find) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Blog not found.")
                });
            }
            const result = await CommentModel.create({blog,name,email,comment});
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Comment sent."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "comment.create"
            });
        }
    };

    /**
     * get comment by admin
     */
    static get = async (req,res) => {
        try {
            let filter = {};
            const {id} = req.params;
            const {blogId} = req.query;

            if (id) filter._id = id;
            if (blogId) filter.blog = blogId;

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await CommentModel.countDocuments(filter);

            const result = await CommentModel.find(filter)
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
                message: "Comment list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({res,error});
        }
    };

    /**
     * delete-comment
     */
    static deleteComment = async (req,res) => {
        try {
            const {id} = req.params;
            const find = await CommentModel.findById(id);
            if (!find) {
                return errorResponse({
                    res,
                    error: Error("Comment not found."),
                    statusCode: 404
                });
            }

            await CommentModel.findByIdAndDelete(id);
            return successResponse({
                res,
                statusCode: 200,
                message: "Comment deleted."
            });
        } catch (error) {
            return errorResponse({res,error});
        }
    };
}

export default controller;
