import mongoose from "mongoose";
import { errorResponse, successResponse } from "../../../helper/apiResponse.js";
import SubcategoryModel from "../subCategory/model.js";
import CategoryModel from "../category/model.js";
import services from "../subCategory/service.js";
import { paginationDetails, paginationFun } from "../../../helper/common.js";
import slugify from "slugify";
import { updateFile, uploadSingleFile } from "../../aws/controller.js";
const folderName = "subCategory";

class controller {
  /**
   * create
   */
  static create = async (req, res) => {
    try {
      const userId = req.user._id;
      const { title, description, category, type } = req.body;

      const findCategory = await CategoryModel.findById(category);
      if (!findCategory) {
        return errorResponse({
          res,
          statusCode: 404,
          error: new Error("Category not found."),
        });
      }

      if (title) {
        const existingTitle = await SubcategoryModel.findOne({ title: title });
        if (existingTitle) {
          return errorResponse({
            res,
            statusCode: 409,
            funName: "subcategory.create",
            error: Error("This title is already used by another subcategory."),
          });
        }
      }

      let url = await uploadSingleFile(req, folderName);
      let slug = slugify(title, { lower: true });

      const doc = {
        title,
        description,
        category,
        type,
        url,
        slug,
        createdBy: userId,
      };
      const result = await services.create(doc);
      findCategory.subCategory.push(result._id);

      await findCategory.save();
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Subcategory is created successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "subcategory.create",
      });
    }
  };

  /**
   * get
   */
  static get = async (req, res) => {
    try {
      const { id } = req.params;
      const { category, type, slug, title } = req.query;
      const pagination = paginationFun(req.query);

      let count, paginationData;

      let filter = {};
      if (id) filter._id = new mongoose.Types.ObjectId(id);
      if (category) filter.category = new mongoose.Types.ObjectId(category);
      if (type) filter.type = { $regex: type, $options: "i" };
      if (title) filter.title = { $regex: title, $options: "i" };
      if (slug) filter.slug = { $regex: new RegExp(`^${slug}$`, "i") };

      count = await SubcategoryModel.countDocuments(filter);
      const results = await services.get(filter, pagination);

      paginationData = paginationDetails({
        limit: pagination.limit,
        page: req.query.page,
        totalItems: count,
      });

      return successResponse({
        res,
        statusCode: 200,
        pagination: paginationData,
        data: results,
        message: "Subcategory retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "subcategory.get",
      });
    }
  };

  /**
   * update
   */
  static update = async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      const { title, description, type } = req.body;
      let slug;

      const findDoc = await SubcategoryModel.findById(id);
      if (!findDoc) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Subcategory not found."),
        });
      }

      if (slug) slugify(title, { lower: true });
      let newUrl = await updateFile(req, findDoc, folderName);
      const updateFields = {
        title,
        description,
        type,
        slug,
        url: newUrl,
        createdBy: userId,
      };

      const updateResult = await services.update(id, updateFields);
      return successResponse({
        res,
        statusCode: 201,
        data: updateResult,
        message: "Subcategory is updated successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "subcategory.update",
      });
    }
  };
}

export default controller;
