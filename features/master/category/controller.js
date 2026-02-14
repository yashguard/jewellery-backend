import slugify from "slugify";
import mongoose from "mongoose";
import CategoryModel from "../category/model.js";
import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import services from "../category/service.js";
import {updateFile,uploadSingleFile} from "../../aws/controller.js";
const folderName = "category";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            let slug;
            const userId = req.user._id;
            const {title,description} = req.body;

            const existingTitle = await CategoryModel.findOne({title: title});
            if (existingTitle) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: Error("This title is already in use by another category.")
                });
            }

            let url = await uploadSingleFile(req,folderName);

            slug = slugify(title,{lower: true});
            const doc = {title,description,url,slug,createdBy: userId};
            const result = await services.create(doc);
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Category created successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "category.create"
            });
        }
    };

    /**
     * get
     */
    static get = async (req,res) => {
        try {
            const {id} = req.params;
            const {title,slug,createdBy} = req.query;

            let filter = {};
            if (id) filter._id = new mongoose.Types.ObjectId(id);
            if (createdBy) filter.createdBy = new mongoose.Types.ObjectId(createdBy);
            if (title) filter.title = {$regex: title,$options: "i"};
            if (slug) filter.slug = {$regex: new RegExp(`^${ slug }$`,'i')};
            const results = await services.get(filter);
            return successResponse({
                res,
                statusCode: 200,
                data: results,
                message: "Category retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "category.get"
            });
        }
    };

    /**
     * update
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const userId = req.user._id;
            const {title,description} = req.body;
            let slug;

            const findDoc = await CategoryModel.findById(id);
            if (!findDoc) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Category not found.")
                });
            }

            if (slug) {slugify(title,{lower: true});}
            let newUrl = await updateFile(req,findDoc,folderName);
            const updateFields = {title,description,slug,url: newUrl,createdBy: userId};
            const result = await services.update(id,updateFields);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Category is updated successfully.",
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "category.update"
            });
        }
    };
}

export default controller;
