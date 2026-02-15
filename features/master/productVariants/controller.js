import mongoose from "mongoose";
import slugify from "slugify";
import ProductVariantModel from "./model.js";
import ProductModel from "../product/model.js";
import PriceModel from "../price/model.js";
import Service from "../productVariants/service.js";
import { discountTypeEnum } from "../../../config/enum.js";
import { errorResponse, successResponse } from "../../../helper/apiResponse.js";
import { paginationDetails, paginationFun } from "../../../helper/common.js";
import {
  updateMultipleFiles,
  uploadMultipleFiles,
} from "../../cloudinary/controller.js";
import { deleteFile } from "../../../helper/cloudinary.js";
import TaxModel from "../tax/model.js";
const folderName = "variants";

class controller {
  /**
   * create
   */
  static create = async (req, res) => {
    try {
      const {
        childSku,
        shortDescription,
        isDraft,
        material,
        metalColor,
        purity,
        weight,
        length,
        width,
        height,
        size,
        range,
        attributes,
        attTitle,
        settingType,
        attWeight,
        attName,
        number,
        cost,
        ratePerGram,
        costWeight,
        costName,
        amount,
        costDiscount,
        saveCost,
        costType,
        costDiscountType,
        metal,
        productSlug,
        discountDescription,
        title,
        quantity,
        rating,
        sales,
        expiresOn,
        availability,
      } = req.body;

      let {
        taxValue,
        totalCost,
        subTotal,
        discountValue,
        discountType,
        savedAmount,
        taxAmount,
      } = req.body;

      if (title) {
        const existingTitle = await ProductVariantModel.findOne({
          title: title,
        });
        if (existingTitle) {
          return errorResponse({
            res,
            statusCode: 409,
            funName: "variant.create",
            error: Error("This title is already used by another variant."),
          });
        }
      }

      if (childSku) {
        const existingSku = await ProductVariantModel.findOne({
          childSku: childSku,
        });
        if (existingSku) {
          return errorResponse({
            res,
            statusCode: 409,
            funName: "variant.create",
            error: Error("This Sku is already used by another variant."),
          });
        }
      }

      const userId = req.user._id;
      const proSlug = await ProductModel.findOne({ slug: productSlug });
      if (!proSlug) {
        return errorResponse({
          res,
          status: 404,
          error: new Error("Product is not found."),
        });
      }
      if (proSlug.hasVariant === false) {
        return errorResponse({
          res,
          status: 404,
          error: new Error("This product has no variant."),
        });
      }

      let slug = slugify(title, { lower: true });
      const price = req.body.price || 0;
      subTotal = parseFloat(price);
      let grandTotal = subTotal;

      if (cost) {
        await Promise.all(
          cost.map(async (item) => {
            const priceDoc = await PriceModel.findOne({ metal: item.metal });
            if (priceDoc) {
              item.ratePerGram = priceDoc.ratePerGram;
              item.costDiscount = priceDoc.discountValue;
              item.costDiscountType = priceDoc.discountType;
            }
            item.totalCost = item.ratePerGram * item.costWeight;
            if (item.costDiscountType === discountTypeEnum.PERCENTAGE) {
              item.saveCost = (item.totalCost * item.costDiscount) / 100;
            } else if (item.costDiscountType === discountTypeEnum.AMOUNT) {
              item.saveCost = item.costDiscount;
            }
            item.totalCost -= item.saveCost;
            item.totalCost = Math.ceil(item.totalCost);
          }),
        );
        subTotal =
          cost.reduce((acc, item) => acc + item.totalCost, 0) + price || 0;
      }

      totalCost = subTotal;
      if (!cost && !taxValue) {
        subTotal = parseFloat(price);
        grandTotal = subTotal;
      }

      grandTotal = subTotal;
      if (discountValue) {
        if (discountType === discountTypeEnum.AMOUNT) {
          subTotal -= discountValue;
          savedAmount = discountValue;
        }

        if (discountType === discountTypeEnum.PERCENTAGE) {
          savedAmount = (subTotal * discountValue) / 100;
          subTotal = subTotal - savedAmount;
        }
      }

      if (!taxValue) {
        grandTotal = subTotal;
      }

      const tax = await TaxModel.findOne();
      taxValue = tax.taxValue;
      if (taxValue) {
        taxAmount = (subTotal * parseFloat(taxValue)) / 100;
        grandTotal = subTotal + taxAmount;
      }

      totalCost = Math.floor(totalCost);
      subTotal = Math.floor(subTotal);
      grandTotal = Math.floor(grandTotal);

      const uploadedImages = await uploadMultipleFiles(req, folderName);
      const doc = {
        files: uploadedImages.map((image) => ({ urls: image.url })),
        taxAmount,
        product: proSlug._id,
        childSku,
        shortDescription,
        isDraft,
        material,
        metalColor,
        purity,
        weight,
        length,
        width,
        height,
        size,
        range,
        price,
        taxValue,
        attributes,
        attTitle,
        settingType,
        attWeight,
        attName,
        number,
        cost,
        ratePerGram,
        costWeight,
        costName,
        amount,
        costDiscount,
        saveCost,
        costType,
        costDiscountType,
        totalCost,
        savedAmount,
        discountType,
        quantity,
        rating,
        sales,
        availability,
        discountDescription,
        grandTotal,
        subTotal,
        discountValue,
        title,
        slug,
        createdBy: userId,
        expiresOn,
        metal,
        productSlug,
      };

      const result = await Service.create(doc);
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Product is created.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "create.productVariant" });
    }
  };

  /**
   * get variant
   */
  static getVariant = async (req, res) => {
    try {
      let filter = {};
      const { id } = req.params;
      const { product, manager, productSlug, slug } = req.query;

      if (id) filter._id = new mongoose.Types.ObjectId(id);
      if (product) filter.product = new mongoose.Types.ObjectId(product);
      if (manager) filter.createdBy = new mongoose.Types.ObjectId(manager);
      if (productSlug)
        filter.productSlug = { $regex: new RegExp(`^${productSlug}$`, "i") };
      if (slug) filter.slug = { $regex: new RegExp(`^${slug}$`, "i") };

      const result = await Service.getVariant(filter);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Variants retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "get.productVariant" });
    }
  };

  /**
   * Get status and prices
   */
  static getStatusAndPrice = async (req, res) => {
    try {
      const { id } = req.params;
      const { product, metalColor, purity, size, attName, slug, productSlug } =
        req.query;

      const matchStage = {};
      matchStage.isDraft = false;

      if (id) matchStage._id = new mongoose.Types.ObjectId(id);
      if (product) matchStage.product = new mongoose.Types.ObjectId(product);
      if (metalColor)
        matchStage.metalColor = { $regex: `^${metalColor}$`, $options: "i" };
      if (purity) matchStage.purity = { $regex: `^${purity}$`, $options: "i" };
      if (slug) matchStage.slug = { $regex: new RegExp(`^${slug}$`, "i") };
      if (productSlug)
        matchStage.productSlug = {
          $regex: new RegExp(`^${productSlug}$`, "i"),
        };
      if (size) matchStage.size = parseFloat(size);
      if (attName) {
        matchStage.attributes = {
          $elemMatch: { attName: { $regex: `^${attName}$`, $options: "i" } },
        };
      }

      const result = await Service.getStatusAndPrice(matchStage);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Variants retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "getStatusAndPrice.productVariant",
      });
    }
  };

  /**
   * get by admin
   */
  static getByAdmin = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        product,
        purity,
        metalColor,
        availability,
        search,
        size,
        slug,
        manager,
        attName,
        expiresOn,
        productSlug,
      } = req.query;
      const matchStage = {};

      if (id) matchStage._id = new mongoose.Types.ObjectId(id);
      if (product) matchStage.product = new mongoose.Types.ObjectId(product);
      if (metalColor)
        matchStage.metalColor = { $regex: `^${metalColor}$`, $options: "i" };
      if (purity) matchStage.purity = { $regex: `^${purity}$`, $options: "i" };
      if (size) matchStage.size = parseFloat(size);
      if (slug) matchStage.slug = { $regex: new RegExp(`^${slug}$`, "i") };
      if (productSlug)
        matchStage.productSlug = {
          $regex: new RegExp(`^${productSlug}$`, "i"),
        };
      if (expiresOn)
        matchStage.expiresOn = { $regex: expiresOn, $options: "i" };
      if (manager) matchStage.createdBy = new mongoose.Types.ObjectId(manager);
      if (attName) {
        matchStage.attributes = {
          $elemMatch: { attName: { $regex: `^${attName}$`, $options: "i" } },
        };
      }
      if (availability !== undefined)
        matchStage.availability = availability === "true";

      if (search) {
        matchStage.$or = [
          { childSku: { $regex: search, $options: "i" } },
          { title: { $regex: search, $options: "i" } },
        ];
      }

      const pagination = paginationFun(req.query);
      let count, paginationData;

      count = await ProductVariantModel.countDocuments(matchStage);
      const result = await Service.getByAdmin(matchStage);
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
        message: "Variants retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "variant.get",
      });
    }
  };

  /**
   * get by customer
   */
  static getDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        attName,
        product,
        productSlug,
        metalColor,
        purity,
        size,
        slug,
        manager,
      } = req.query;
      const matchStage = {};

      if (id) matchStage._id = new mongoose.Types.ObjectId(id);
      if (product) matchStage.product = new mongoose.Types.ObjectId(product);
      if (slug) matchStage.slug = { $regex: new RegExp(`^${slug}$`, "i") };
      if (productSlug)
        matchStage.productSlug = {
          $regex: new RegExp(`^${productSlug}$`, "i"),
        };
      if (metalColor)
        matchStage.metalColor = { $regex: `^${metalColor}$`, $options: "i" };
      if (purity) matchStage.purity = { $regex: `^${purity}$`, $options: "i" };
      if (size) matchStage.size = parseFloat(size);
      if (manager) filter.createdBy = new mongoose.Types.ObjectId(manager);
      if (attName) {
        matchStage.attributes = {
          $elemMatch: { attName: { $regex: `^${attName}$`, $options: "i" } },
        };
      }

      const pagination = paginationFun(req.query);
      let count, paginationData;
      count = await ProductVariantModel.countDocuments(matchStage);

      const result = await Service.getDetails(matchStage);
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
        message: "Variants retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "variant.get",
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
        shortDescription,
        isDraft,
        material,
        metalColor,
        purity,
        weight,
        length,
        width,
        height,
        size,
        expiresOn,
        metal,
        range,
        price,
        attributes,
        attTitle,
        settingType,
        attWeight,
        attName,
        number,
        cost,
        ratePerGram,
        costWeight,
        costName,
        amount,
        costDiscount,
        saveCost,
        costType,
        discountDescription,
        title,
        quantity,
        rating,
        sales,
        availability,
      } = req.body;

      let {
        taxValue,
        discountType,
        discountValue,
        savedAmount,
        totalCost,
        taxAmount,
      } = req.body;
      const existingVariant = await ProductVariantModel.findById(id);
      if (!existingVariant) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Variant not found"),
        });
      }

      let subTotal = price || existingVariant.price;

      if (cost) {
        await Promise.all(
          cost.map(async (item) => {
            const priceDoc = await PriceModel.findOne({ metal: item.metal });
            if (priceDoc) {
              item.ratePerGram = priceDoc.ratePerGram;
              item.costDiscount = priceDoc.discountValue;
              item.costDiscountType = priceDoc.discountType;
            }
            item.totalCost = item.ratePerGram * item.costWeight;
            if (item.costDiscountType === discountTypeEnum.PERCENTAGE) {
              item.saveCost = (item.totalCost * item.costDiscount) / 100;
            } else if (item.costDiscountType === discountTypeEnum.AMOUNT) {
              item.saveCost = item.costDiscount;
            }
            item.totalCost -= item.saveCost;
            item.totalCost = Math.ceil(item.totalCost);
          }),
        );
        subTotal = cost.reduce((acc, item) => acc + item.totalCost, 0);
      }

      if (existingVariant.cost && existingVariant.cost.length > 0) {
        existingVariant.cost.forEach((item) => {
          subTotal += item.totalCost;
        });
      }

      totalCost = subTotal;
      const applyDiscount = (value, type) => {
        if (type === discountTypeEnum.AMOUNT) {
          return { newSubTotal: subTotal - value, savedAmount: value };
        } else if (type === discountTypeEnum.PERCENTAGE) {
          const discountAmount = (subTotal * value) / 100;
          return {
            newSubTotal: subTotal - discountAmount,
            savedAmount: discountAmount,
          };
        }
        return { newSubTotal: subTotal, savedAmount: 0 };
      };

      if (discountValue && !discountType) {
        discountType = existingVariant.discountType;
      }

      if (discountValue) {
        ({ newSubTotal: subTotal, savedAmount } = applyDiscount(
          discountValue,
          discountType,
        ));
      } else if (
        existingVariant.discountValue &&
        existingVariant.discountType
      ) {
        ({ newSubTotal: subTotal, savedAmount } = applyDiscount(
          existingVariant.discountValue,
          existingVariant.discountType,
        ));
      }

      let grandTotal = subTotal;

      const tax = await TaxModel.findOne();
      taxValue = tax.taxValue;

      if (taxValue) {
        taxAmount = (subTotal * parseFloat(taxValue)) / 100;
        grandTotal = subTotal + taxAmount;
      } else if (existingProduct.taxValue) {
        grandTotal += (subTotal * parseFloat(existingProduct.taxValue)) / 100;
      }

      totalCost = Math.floor(totalCost);
      subTotal = Math.floor(subTotal);
      grandTotal = Math.floor(grandTotal);

      const findDoc = await ProductVariantModel.findById(id);
      let files = await updateMultipleFiles(req, findDoc, folderName);
      const slug = title ? slugify(title, { lower: true }) : findDoc.slug;

      const doc = {
        shortDescription,
        isDraft,
        material,
        metalColor,
        purity,
        weight,
        length,
        width,
        height,
        size,
        quantity,
        rating,
        sales,
        taxAmount,
        range,
        price,
        taxValue,
        attTitle,
        settingType,
        attWeight,
        attName,
        number,
        ratePerGram,
        costWeight,
        costName,
        slug,
        title,
        amount,
        costDiscount,
        saveCost,
        costType,
        totalCost,
        savedAmount,
        discountDescription,
        grandTotal,
        subTotal,
        files: files,
        discountType,
        attributes: attributes
          ? [...existingVariant.attributes, ...attributes]
          : existingVariant.attributes,
        discountValue,
        cost: cost ? [...existingVariant.cost, ...cost] : existingVariant.cost,
        availability,
        expiresOn,
        metal,
      };
      const result = await Service.update(id, doc);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Variant is updated successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "variant.update" });
    }
  };

  /**
   * update cost
   */
  static updateCost = async (req, res) => {
    try {
      const { id, costId } = req.params;
      const {
        metal,
        amount,
        ratePerGram,
        costWeight,
        costDiscount,
        saveCost,
        costType,
        costDiscountType,
      } = req.body;
      let { savedAmount, totalCost, subTotal } = req.body;
      const existingVar = await ProductVariantModel.findById(id);
      if (!existingVar) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Product not found"),
        });
      }

      const costIndex = existingVar.cost.findIndex(
        (cost) => cost._id.toString() === costId,
      );
      if (costIndex === -1) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Cost not found"),
        });
      }

      const updatedFields = {
        metal,
        amount,
        ratePerGram,
        costWeight,
        costDiscount,
        saveCost,
        costType,
        costDiscountType,
        totalCost,
      };

      Object.keys(updatedFields).forEach((field) => {
        if (updatedFields[field]) {
          existingVar.cost[costIndex][field] = updatedFields[field];
        }
      });

      subTotal = existingVar.price;
      if (existingVar.cost) {
        await Promise.all(
          existingVar.cost.map(async (item) => {
            const priceDoc = await PriceModel.findOne({ metal: item.metal });
            if (priceDoc) {
              item.ratePerGram = priceDoc.ratePerGram;
              item.costDiscount = priceDoc.discountValue;
              item.costDiscountType = priceDoc.discountType;
            }
            item.totalCost = item.ratePerGram * item.costWeight;
            if (item.costDiscountType === discountTypeEnum.PERCENTAGE) {
              item.saveCost = (item.totalCost * item.costDiscount) / 100;
            } else if (item.costDiscountType === discountTypeEnum.AMOUNT) {
              item.saveCost = item.costDiscount;
            }
            item.totalCost -= item.saveCost;
            item.totalCost = Math.ceil(item.totalCost);
          }),
        );

        subTotal =
          existingVar.cost.reduce((acc, item) => acc + item.totalCost, 0) +
            existingVar.price || 0;
      }

      totalCost = subTotal;
      if (existingVar.discountValue && existingVar.discountType) {
        if (existingVar.discountType === discountTypeEnum.AMOUNT) {
          subTotal -= existingVar.discountValue;
          savedAmount = existingVar.discountValue;
        }

        if (existingVar.discountType === discountTypeEnum.PERCENTAGE) {
          savedAmount = (subTotal * existingVar.discountValue) / 100;
          subTotal = subTotal - savedAmount;
        }
      }

      let grandTotal = subTotal;
      if (existingVar.taxValue) {
        grandTotal += (subTotal * parseFloat(existingVar.taxValue)) / 100;
      }

      totalCost = Math.floor(totalCost);
      subTotal = Math.floor(subTotal);
      grandTotal = Math.floor(grandTotal);

      existingVar.subTotal = subTotal;
      existingVar.totalCost = totalCost;
      existingVar.grandTotal = grandTotal;
      existingVar.savedAmount = savedAmount;

      await existingVar.save();
      return successResponse({
        res,
        statusCode: 200,
        data: existingVar,
        message: "Product cost updated successfully",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "variant.updateCost" });
    }
  };

  /**
   * update attributes
   */
  static updateAttribute = async (req, res) => {
    try {
      const { id, attributeId } = req.params;
      const { attTitle, attName, settingType, attWeight, number } = req.body;

      const existingVar = await ProductVariantModel.findById(id);
      if (!existingVar) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Variant not found"),
        });
      }

      const attIndex = existingVar.attributes.findIndex(
        (attributes) => attributes._id.toString() === attributeId,
      );
      if (attIndex === -1) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Attribute not found"),
        });
      }
      if (attTitle) {
        existingVar.attributes[attIndex].attTitle = attTitle;
      }
      if (attName) {
        existingVar.attributes[attIndex].attName = attName;
      }
      if (settingType) {
        existingVar.attributes[attIndex].settingType = settingType;
      }
      if (attWeight) {
        existingVar.attributes[attIndex].attWeight = attWeight;
      }
      if (number) {
        existingVar.attributes[attIndex].number = number;
      }

      await existingVar.save();
      return successResponse({
        res,
        statusCode: 200,
        data: existingVar,
        message: "Attribute is updated successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "variant.updateAttribute" });
    }
  };

  /**
   * delete single file
   */
  static deleteSingleFile = async (req, res) => {
    try {
      const { id, fileId } = req.params;

      const existingVar = await ProductVariantModel.findById(id);
      if (!existingVar) {
        return errorResponse({
          res,
          statusCode: 404,
          error: new Error("Variant not found."),
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

      if (existingVar.files && existingVar.files.length > 0) {
        deleteFromImages(existingVar.files);
      }

      if (!fileDeleted && existingVar.files && existingVar.urls.length > 0) {
        deleteFromImages(existingVar.urls);
      }

      if (!fileDeleted) {
        return errorResponse({
          res,
          statusCode: 404,
          error: new Error("File not found."),
        });
      }

      await existingVar.save();
      return successResponse({
        res,
        statusCode: 200,
        message: "File is deleted.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**
   * remove cost
   */
  static removeCost = async (req, res) => {
    try {
      const { id, costId } = req.params;
      let { savedAmount, totalCost } = req.body;

      const existingVar = await ProductVariantModel.findById(id);
      if (!existingVar) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Product not found"),
        });
      }

      const costIndex = existingVar.cost.findIndex(
        (cost) => cost._id.toString() === costId,
      );
      if (costIndex === -1) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Cost not found"),
        });
      }

      existingVar.cost.splice(costIndex, 1);
      let subTotal = existingVar.price;

      existingVar.cost.forEach((cost) => {
        subTotal += cost.totalCost;
      });

      totalCost = subTotal;

      if (existingVar.discountValue && existingVar.discountType) {
        if (existingVar.discountType === discountTypeEnum.AMOUNT) {
          subTotal -= existingVar.discountValue;
          savedAmount = existingVar.discountValue;
        }

        if (existingVar.discountType === discountTypeEnum.PERCENTAGE) {
          savedAmount = (subTotal * existingVar.discountValue) / 100;
          subTotal = subTotal - savedAmount;
        }
      }

      let grandTotal = subTotal;

      if (existingVar.taxValue) {
        grandTotal += (subTotal * parseFloat(existingVar.taxValue)) / 100;
      }

      totalCost = Math.floor(totalCost);
      subTotal = Math.floor(subTotal);
      grandTotal = Math.floor(grandTotal);

      existingVar.subTotal = subTotal;
      existingVar.totalCost = totalCost;
      existingVar.grandTotal = grandTotal;
      existingVar.savedAmount = savedAmount;

      await existingVar.save();

      return res.json({
        success: true,
        message: "Cost removed successfully",
        data: existingVar,
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "variant.removeCost" });
    }
  };

  /**
   * remove attribute
   */
  static removeAttribute = async (req, res) => {
    try {
      const { id, attributeId } = req.params;

      const exVar = await ProductVariantModel.findById(id);
      if (!exVar) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Variant not found"),
        });
      }

      const attIndex = exVar.attributes.findIndex(
        (attributes) => attributes._id.toString() === attributeId,
      );
      if (attIndex === -1) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Attribute not found"),
        });
      }
      exVar.attributes.splice(attIndex, 1);
      await exVar.save();

      return successResponse({
        res,
        statusCode: 200,
        message: "Attribute is remove successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "Variant.removeAttribute" });
    }
  };
}
export default controller;
