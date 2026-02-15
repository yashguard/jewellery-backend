import { successResponse, errorResponse } from "../../../helper/apiResponse.js";
import { deleteFile, uploadFile } from "../../../helper/cloudinary.js";
import Services from "../home/service.js";
import HomeModel from "./model.js";
import mongoose from "mongoose";
import ProductModel from "../product/model.js";
import { updateFile, uploadMultipleFiles } from "../../cloudinary/controller.js";
import { config } from "../../../config/config.js";
import BlogModel from "../blog/model.js";
import { v4 as uuidv4 } from "uuid";
import ProductReviewModel from "../../productReview/model.js";
import { blogTypeEnum } from "../../../config/enum.js";

const folderName = "home";

class controller {
  /**
   * create
   */
  static create = async (req, res) => {
    try {
      const {
        category,
        subCategory,
        redirectUrl,
        type,
        giftTitle,
        title,
        range,
      } = req.body;
      const uploadedImages = await uploadMultipleFiles(req, folderName);

      const doc = {
        category,
        subCategory,
        type,
        files: uploadedImages.map((image) => ({
          urls: image.url,
          redirectUrl,
          category,
          subCategory,
          title,
          giftTitle,
          range,
        })),
      };

      const result = await Services.create(doc);
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Home page is created successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "home.create",
      });
    }
  };

  /**
   * get
   */
  static get = async (req, res) => {
    try {
      const { id } = req.params;
      const { type } = req.query;

      const filter = {};
      if (id) filter._id = new mongoose.Types.ObjectId(id);
      if (type) filter.type = { $regex: new RegExp(`^${type}$`, "i") };

      const result = await HomeModel.find(filter)
        .populate({ path: "files.category", select: "title url slug" })
        .populate({ path: "files.subCategory", select: "title url slug" });

      const bestSeller = await ProductModel.find({
        sales: { $gt: 1 },
        isDraft: false,
      })
        .select("files title slug grandTotal subTotal category label")
        .populate({ path: "category", select: "title" })
        .sort({ sales: -1 })
        .limit(15);

      const newArrivals = await ProductModel.find({ isDraft: false })
        .select("files title slug grandTotal subTotal category label")
        .populate({ path: "category", select: "title" })
        .sort({ createdAt: -1 });

      const trendingProducts = await ProductModel.find({
        label: "trending",
        isDraft: false,
      })
        .select("files title slug grandTotal subTotal category label")
        .populate({ path: "category", select: "title" })
        .sort({ createdAt: -1 });

      const featured = await ProductModel.find({
        isFeatured: true,
        isDraft: false,
      })
        .select("files title slug grandTotal subTotal category label")
        .populate({ path: "category", select: "title" })
        .sort({ createdAt: -1 });

      const blogs = await BlogModel.find({ type: blogTypeEnum.IMAGE })
        .limit(3)
        .select("title url createdAt")
        .sort({ createdAt: -1 });

      const customerReview = await ProductReviewModel.find({
        rating: { $in: [4, 4.5, 5] },
      })
        .populate({ path: "user", select: "username url" })
        .select("message rating createdAt user")
        .limit(10)
        .sort({ createdAt: -1 });

      return successResponse({
        res,
        statusCode: 200,
        data: {
          result,
          bestSeller,
          newArrivals,
          featured,
          blogs,
          trendingProducts,
          customerReview,
        },
        message: "Home page retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "home.get",
      });
    }
  };

  /**
   * update
   */
  static update = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        category,
        subCategory,
        redirectUrl,
        type,
        giftTitle,
        title,
        range,
      } = req.body;

      const find = await HomeModel.findById(id);
      if (!find) {
        return errorResponse({
          res,
          statusCode: 404,
          error: new Error("Page not found."),
        });
      }

      const files = req.files || [];
      const newFiles = [];

      for (const file of files) {
        const originalName = file.originalname;
        const fileExt = originalName.split(".").pop();
        const name = `${uuidv4()}.${fileExt}`;

        await uploadFile({
          filename: `${config.cloud.digitalocean.foldername}/${name}`,
          file: file.buffer,
          ACL: "public-read",
        });

        const fileUrl = `${config.cloud.digitalocean.base_url}/${config.cloud.digitalocean.foldername}/${name}`;

        const newFile = {
          urls: fileUrl,
          redirectUrl,
          category,
          subCategory,
          title,
          giftTitle,
          range,
        };

        newFiles.push(newFile);
      }

      const combinedFiles = [...find.files, ...newFiles];
      const doc = { files: combinedFiles, type };
      const result = await HomeModel.findByIdAndUpdate(id, doc, { new: true })
        .lean()
        .exec();

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Page is updated.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "PageController.update",
      });
    }
  };

  /**
   * delete
   */
  static delete = async (req, res) => {
    try {
      const { id } = req.params;

      const find = await HomeModel.findById(id);
      if (!find) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Page not found."),
        });
      }

      for (const image of find.files) {
        await deleteFile({
          filename: image.urls,
        });
      }

      await Services.delete(id);
      return successResponse({
        res,
        statusCode: 200,
        message: "Page is deleted",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "page.delete",
      });
    }
  };

  /**
   * delete single file
   */
  static deleteSingleFile = async (req, res) => {
    try {
      const { id, fileId } = req.params;

      const page = await HomeModel.findById(id);
      if (!page) {
        return errorResponse({
          res,
          statusCode: 404,
          error: new Error("Record not found."),
        });
      }

      let fileDeleted = false;

      const deleteFromImages = (files) => {
        const index = files.findIndex((file) => file._id.toString() === fileId);
        if (index !== -1) {
          const filename = files[index].urls;
          deleteFile({
            filename: filename,
          });
          files.splice(index, 1);
          fileDeleted = true;
        }
      };

      if (page.files && page.files.length > 0) {
        deleteFromImages(page.files);
      }

      if (!fileDeleted && page.urls && page.urls.length > 0) {
        deleteFromImages(page.urls);
      }

      if (!fileDeleted) {
        return errorResponse({
          res,
          statusCode: 404,
          error: new Error("Record not found."),
        });
      }

      await page.save();
      return successResponse({
        res,
        statusCode: 200,
        message: "Record is deleted.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**
   * Update single record
   */
  static updateSingleRecord = async (req, res) => {
    try {
      const { id, docId } = req.params;
      const { range, title, redirectUrl, category, subCategory, giftTitle } =
        req.body;

      const existingDoc = await HomeModel.findById(id);
      if (!existingDoc) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Record not found"),
        });
      }

      const docIndex = existingDoc.files.findIndex(
        (files) => files._id.toString() === docId,
      );
      if (docIndex === -1) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Record not found"),
        });
      }
      let newUrl = await updateFile(req, existingDoc, folderName);
      if (range) {
        existingDoc.files[docIndex].range = range;
      }
      if (req.file) {
        existingDoc.files[docIndex].urls = newUrl;
      }
      if (title) {
        existingDoc.files[docIndex].title = title;
      }
      if (redirectUrl) {
        existingDoc.files[docIndex].redirectUrl = redirectUrl;
      }
      if (category) {
        existingDoc.files[docIndex].category = category;
      }
      if (subCategory) {
        existingDoc.files[docIndex].subCategory = subCategory;
      }
      if (giftTitle) {
        existingDoc.files[docIndex].giftTitle = giftTitle;
      }

      await existingDoc.save();
      return successResponse({
        res,
        statusCode: 200,
        data: existingDoc,
        message: "Record is updated successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "page.updateSingleRecord",
      });
    }
  };
}
export default controller;
