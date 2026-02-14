import mongoose from "mongoose";
import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import FilterModel from "./model.js";
import CategoryModel from "../category/model.js";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            const {category,title,filters,displayName,query,type} = req.body;

            const existingCategory = await CategoryModel.findById(category);
            if (!existingCategory) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Category not found.")
                });
            }

            const doc = {category,title,filters,displayName,query,type};
            const result = await FilterModel.create(doc);
            existingCategory.filters.push(result._id);
            await existingCategory.save();

            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Filter added successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "create.filters"
            });
        }
    };

    /**
     * get
     */
    static get = async (req,res) => {
        try {
            const {id} = req.params;
            const {category} = req.query;

            let filter = {};
            if (id) filter._id = new mongoose.Types.ObjectId(id);
            if (category) filter.category = new mongoose.Types.ObjectId(category);

            const result = await FilterModel.aggregate([
                {
                    $match: filter
                },
                {
                    $lookup: {
                        from: "categories",
                        localField: "category",
                        foreignField: "_id",
                        as: "category"
                    }
                },
                {
                    $unwind: "$category"
                },
                {
                    $lookup: {
                        from: "subcategories",
                        localField: "category.subCategory",
                        foreignField: "_id",
                        as: "category.subCategory"
                    }
                },
                {
                    $project: {
                        "category.filters": 0,
                        "category.subCategory.category": 0,
                        "category.subCategory.description": 0,
                        "category.subCategory.type": 0,
                        "category.subCategory.createdAt": 0,
                        "category.subCategory.updatedAt": 0,
                    }
                }
            ]);

            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Filter list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "get.filters"
            });
        }
    };

    /**
     * update
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {filters,title,displayName,query,type} = req.body;

            const existingFilter = await FilterModel.findById(id);
            if (!existingFilter) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Filter not found.")
                });
            }

            const doc = {
                title,query,displayName,type,
                filters: filters ? [ ...existingFilter.filters,...filters ] : existingFilter.filters
            };

            const result = await FilterModel.findByIdAndUpdate(id,{$set: doc},{new: true});
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Filter is updated successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "update.filters"
            });
        }
    };

    /**
     * update single filter
     */
    static updateFilter = async (req,res) => {
        try {
            const {id,filterId} = req.params;
            const {displayName,query,type} = req.body;

            const existingFilter = await FilterModel.findById(id);
            if (!existingFilter) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Filter not found.")
                });
            }

            const filterIndex = existingFilter.filters.findIndex(filter => filter._id.toString() === filterId);
            if (filterIndex === -1) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Filter not found.")
                });
            }
            const doc = existingFilter.filters[ filterIndex ];

            doc.displayName = displayName;
            doc.query = query;
            doc.type = type;

            const result = await FilterModel.findByIdAndUpdate(id,{$set: {filters: existingFilter.filters}},{new: true});
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Filter is updated successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "updateFilter.filters"
            });
        }
    };

    /**
     * delete single filter
     */
    static deleteSingleFilter = async (req,res) => {
        try {
            const {id,filterId} = req.params;

            const existingFilter = await FilterModel.findById(id);
            if (!existingFilter) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Filter not found.")
                });
            }

            const filterIndex = existingFilter.filters.findIndex(filter => filter._id.toString() === filterId);
            if (filterIndex === -1) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Filter not found.")
                });
            }
            existingFilter.filters.splice(filterIndex,1);
            await existingFilter.save();

            return successResponse({
                res,
                statusCode: 200,
                message: "Filter is deleted."
            });

        } catch (error) {

        }
    };

    /**
     * delete
     */
    static delete = async (req,res) => {
        try {
            const {id} = req.params;

            const existingFilter = await FilterModel.findById(id);
            if (!existingFilter) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Filter not found.")
                });
            }

            const existCategory = await CategoryModel.findById(existingFilter.category);
            existCategory.filters.pull(id);

            await existCategory.save();
            await FilterModel.findByIdAndDelete(id);

            return successResponse({
                res,
                statusCode: 200,
                message: "Filter is deleted successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "delete.filters"
            });
        }
    };
}

export default controller;
