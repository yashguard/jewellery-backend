import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import {deleteFile} from "../../helper/aws_s3.js";
import {paginationDetails,paginationFun} from "../../helper/common.js";
import ProductReviewModel from "../productReview/model.js";
import ProductModel from "../master/product/model.js";
import {uploadMultipleFiles} from "../aws/controller.js";
import mongoose from "mongoose";
const folderName = "reviews";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            const userId = req.user._id;
            const {product,rating,title,message} = req.body;

            const find = await ProductModel.findById(product);
            if (!find) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Product not found."),
                    funName: "productReview.create"
                });
            }

            const uploadedImages = await uploadMultipleFiles(req,folderName);
            const result = await ProductReviewModel.create({files: uploadedImages.map((image) => ({urls: image.url})),product,rating,title,message,user: userId});
            const populateData = await ProductReviewModel.findById(result._id)
                .populate({path: "user", select: "username email url"})

            return successResponse({
                res,
                statusCode: 201,
                data: populateData,
                message: "Your review is added successfully. Thank you !"
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "productReview.create"
            });
        }
    };

    /**
     * get
     */
    static get = async (req,res) => {
        try {
            const {id} = req.params;
            const {search,product} = req.query;

            let filter = {};
            if (id) filter._id = new mongoose.Types.ObjectId(id);
            if (product) filter.product = new mongoose.Types.ObjectId(product);
            if (search) {
                filter.$or = [
                    {title: {$regex: new RegExp(search,'i')}},
                    {message: {$regex: new RegExp(search,'i')}}
                ];

                const parsedRating = parseFloat(search);
                if (!isNaN(parsedRating)) {
                    filter.$or.push({rating: parsedRating});
                }
            }

            const pagination = paginationFun(req.query);
            const count = await ProductReviewModel.countDocuments(filter);

            const result = await ProductReviewModel.aggregate([
                {$match: filter},
                {$sort: {createdAt: -1}},
                {$skip: pagination.skip},
                {$limit: pagination.limit},
                {
                    $lookup: {
                        from: "products",
                        localField: "product",
                        foreignField: "_id",
                        as: "product"
                    }
                },
                {
                    $unwind: {
                        path: "$product",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                {
                    $unwind: {
                        path: "$user",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        "product._id": 1,
                        "product.slug": 1,
                        "product.title": 1,
                        "product.files": 1,
                        "product.sku": 1,
                        "user.username": 1,
                        "user.customerId": 1,
                        "user.email": 1,
                        "user.url": 1,
                        "title": 1,
                        "message": 1,
                        "files": 1,
                        "rating": 1,
                        "createdAt": 1,
                        "updatedAt": 1
                    }
                }
            ]);

            const paginationData = paginationDetails({
                limit: pagination.limit,
                page: req.query.page,
                totalItems: count,
            });

            return successResponse({
                res,
                statusCode: 200,
                pagination: paginationData,
                data: result,
                message: "Review list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({res,error,funName: "productReview.get"});
        }
    };

    /**
     * delete 
     */
    static deleteProductReview = async (req,res) => {
        try {
            const {id} = req.params;

            const find = await ProductReviewModel.findById(id);
            if (!find) {
                return errorResponse({
                    res,
                    error: Error("Review not found."),
                    statusCode: 404,
                    funName: "productReview.delete"
                });
            }

            const deleteFilePromises = find.files.map(async (file) => {
                await deleteFile({
                    filename: file.urls
                });
            });
            await Promise.all(deleteFilePromises);
            await ProductReviewModel.findByIdAndDelete(id);

            return successResponse({
                res,
                statusCode: 200,
                message: "Review is deleted."
            });
        } catch (error) {
            return errorResponse({res,error,funName: "productReview.delete"});
        }
    };
}
export default controller;
