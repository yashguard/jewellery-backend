import { errorResponse, successResponse } from "../../../helper/apiResponse.js";
import { deleteFile } from "../../../helper/cloudinary.js";
import Services from "../product/service.js";
import ProductModel from "./model.js";
import mongoose from "mongoose";
import { paginationFun, paginationDetails } from "../../../helper/common.js";
import { discountTypeEnum } from "../../../config/enum.js";
import slugify from "slugify";
import {
  updateMultipleFiles,
  uploadMultipleFiles,
} from "../../cloudinary/controller.js";
import PriceModel from "../price/model.js";
import CategoryModel from "../category/model.js";
import SubCategoryModel from "../subCategory/model.js";
import TaxModel from "../tax/model.js";
const folderName = "product";

class controller {
  /**
   * create
   */
  static create = async (req, res) => {
    try {
      const {
        name,
        description,
        manufacturerName,
        sku,
        category,
        subCategory,
        shopFor,
        tag,
        material,
        occasion,
        collections,
        giftType,
        isDraft,
        hasVariant,
        isRing,
        isFeatured,
        metalColor,
        costDiscount,
        costDiscountType,
        ratePerGram,
        discountType,
        amount,
        attributes,
        purity,
        weight,
        length,
        width,
        height,
        size,
        range,
        expiresOn,
        cost,
        costWeight,
        saveCost,
        costType,
        label,
        availability,
        attTitle,
        settingType,
        attWeight,
        number,
        discountDescription,
        quantity,
        rating,
        sales,
        attName,
        title,
        discountValue,
        metal,
      } = req.body;

      let totalCost, taxValue, taxAmount;
      const findCategory = await CategoryModel.findById(category);
      const findSubCate = await SubCategoryModel.findById(subCategory);

      if (category) {
        if (!findCategory) {
          return errorResponse({
            res,
            statusCode: 404,
            error: Error("Category not found."),
          });
        }
      } else if (subCategory) {
        if (!findSubCate) {
          return errorResponse({
            res,
            statusCode: 404,
            error: Error("Sub category not found."),
          });
        }
      } else if (!category && !subCategory) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Category and sub category not found."),
        });
      }

      if (title) {
        const existingTitle = await ProductModel.findOne({ title: title });
        if (existingTitle) {
          return errorResponse({
            res,
            statusCode: 409,
            funName: "product.create",
            error: Error("This title is already used by another product."),
          });
        }
      }

      if (sku) {
        const existingSku = await ProductModel.findOne({ sku: sku });
        if (existingSku) {
          return errorResponse({
            res,
            statusCode: 409,
            funName: "product.create",
            error: Error("This Sku is already used by another product."),
          });
        }
      }

      let savedAmount;
      const userId = req.user._id;
      let slug = slugify(title, { lower: true });

      const price = req.body.price || 0;
      let subTotal = parseFloat(price);
      let grandTotal = subTotal;

      if (cost) {
        await Promise.all(
          cost.map(async (item) => {
            const priceDoc = await PriceModel.findOne({ metal: item.metal });
            if (!priceDoc) {
              return errorResponse({
                res,
                statusCode: 404,
                funName: "product.create",
                error: Error("Price document not found for this metal."),
              });
            }
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
        taxValue,
        taxAmount,
        availability,
        name,
        description,
        manufacturerName,
        sku,
        category,
        subCategory,
        shopFor,
        tag,
        material,
        occasion,
        collections,
        giftType,
        isDraft,
        hasVariant,
        isRing,
        isFeatured,
        metalColor,
        purity,
        weight,
        length,
        width,
        height,
        size,
        range,
        price,
        cost,
        ratePerGram,
        costWeight,
        metal,
        createdBy: userId,
        metal,
        amount,
        costDiscount,
        saveCost,
        costType,
        costDiscountType,
        totalCost,
        attributes,
        attTitle,
        settingType,
        attWeight,
        number,
        expiresOn,
        label,
        savedAmount,
        discountType,
        discountDescription,
        grandTotal,
        subTotal,
        discountValue,
        attName,
        title,
        slug,
        quantity,
        rating,
        sales,
      };

      const result = await Services.create(doc);
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Product is created.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "product.create",
      });
    }
  };

  /**
   * get product
   */
  static getProduct = async (req, res) => {
    try {
      const { id } = req.params;
      const {
        metalColor,
        manager,
        metal,
        attName,
        tag,
        label,
        sort,
        purity,
        shopFor,
        price,
        productType,
        weight,
        material,
        occasion,
        giftType,
        collections,
        category,
        availability,
        slug,
        subcategorySlug,
        categorySlug,
        featured,
        discount,
        color,
      } = req.query;

      const matchStage = {};
      matchStage.isDraft = false;

      if (id) matchStage._id = new mongoose.Types.ObjectId(id);
      if (category) matchStage.category = new mongoose.Types.ObjectId(category);
      if (manager) matchStage.createdBy = new mongoose.Types.ObjectId(manager);
      if (productType)
        matchStage.productType = new mongoose.Types.ObjectId(productType);
      if (purity) matchStage.purity = { $regex: `^${purity}$`, $options: "i" };
      if (slug) matchStage.slug = { $regex: new RegExp(`^${slug}$`, "i") };
      if (label) matchStage.label = { $regex: new RegExp(`^${label}$`, "i") };
      if (shopFor)
        matchStage.shopFor = { $regex: `^${shopFor}$`, $options: "i" };
      if (weight) matchStage.weight = { $regex: `^${weight}$`, $options: "i" };
      if (material)
        matchStage.material = { $regex: `^${material}$`, $options: "i" };
      if (occasion)
        matchStage.occasion = { $regex: `^${occasion}$`, $options: "i" };
      if (giftType)
        matchStage.giftType = { $regex: `^${giftType}$`, $options: "i" };
      if (metalColor)
        matchStage.metalColor = { $regex: `^${metalColor}$`, $options: "i" };
      if (collections)
        matchStage.collections = { $regex: `^${collections}$`, $options: "i" };
      if (availability !== undefined)
        matchStage.availability = availability === "true";
      if (featured !== undefined) matchStage.isFeatured = featured === "true";
      if (discount !== undefined) matchStage.discountValue = { $gt: 1 };

      if (attName) {
        matchStage.attributes = {
          $elemMatch: { attName: { $regex: new RegExp(`^${attName}$`, "i") } },
        };
      }

      if (color) {
        matchStage["cost.metal"] = {
          $in: color.split(" ").map((m) => new RegExp(`^${m}$`, "i")),
        };
      }

      if (metal) {
        matchStage["cost.metal"] = metal;
      }

      if (tag) {
        matchStage.tag = { $all: tag.split(",").map((t) => t.trim()) };
      }

      /**sort data */
      let sortStage = {};
      if (sort) {
        if (sort === "price_asc") {
          sortStage.grandTotal = 1;
        } else if (sort === "price_dec") {
          sortStage.grandTotal = -1;
        } else if (sort === "featured") {
          matchStage.isFeatured = true;
          sortStage = { isFeatured: -1, createdAt: -1 };
        } else if (sort === "discount") {
          matchStage.discountValue = { $gt: 0 };
          sortStage.discountValue = -1;
        } else if (sort === "newest") {
          sortStage.createdAt = -1;
        }
      } else {
        sortStage = { createdAt: -1 };
      }

      if (price) {
        const priceRange = price.split("-");
        if (priceRange.length === 2) {
          const minPrice = parseFloat(priceRange[0]);
          const maxPrice = parseFloat(priceRange[1]);
          matchStage.grandTotal = { $gte: minPrice, $lte: maxPrice };
        } else {
          const priceFilter = parseFloat(price.split("-")[1]);
          const filterType = price.includes("under")
            ? "under"
            : price.includes("over")
              ? "over"
              : null;
          if (filterType === "under") {
            matchStage.grandTotal = { $lte: priceFilter };
          } else if (filterType === "over") {
            matchStage.grandTotal = { $gte: priceFilter };
          }
        }
      }

      const pipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
      ];

      const subCatePipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "subcategories",
            localField: "subCategory",
            foreignField: "_id",
            as: "subCategory",
          },
        },
        { $unwind: "$subCategory" },
      ];

      if (categorySlug) {
        pipeline.push({
          $match: {
            "category.slug": { $regex: new RegExp(`^${categorySlug}$`, "i") },
          },
        });
      }

      if (subcategorySlug) {
        subCatePipeline.push({
          $match: {
            "subCategory.slug": {
              $regex: new RegExp(`^${subcategorySlug}$`, "i"),
            },
          },
        });
      }

      const pagination = paginationFun(req.query);

      if (categorySlug) {
        let countPipeline = [...pipeline, { $count: "total" }];
        let countResult = await ProductModel.aggregate(countPipeline);
        let count = countResult.length > 0 ? countResult[0].total : 0;

        pipeline.push({ $sort: sortStage });
        pipeline.push({ $skip: pagination.skip });
        pipeline.push({ $limit: pagination.limit });
        pipeline.push({
          $project: {
            files: 1,
            name: 1,
            description: 1,
            discount: 1,
            grandTotal: 1,
            title: 1,
            slug: 1,
            discountValue: 1,
            label: 1,
            tag: 1,
            totalCost: 1,
            availability: 1,
            "category._id": 1,
            "category.title": 1,
            "category.url": 1,
            "category.slug": 1,
            cost: 1,
          },
        });

        const result = await ProductModel.aggregate(pipeline).exec();

        let paginationData = paginationDetails({
          limit: pagination.limit,
          page: req.query.page,
          totalItems: count,
        });
        return successResponse({
          res,
          statusCode: 200,
          pagination: paginationData,
          data: result,
          message: "Products retrieved successfully.",
        });
      }

      if (subcategorySlug) {
        let countPipeline = [...subCatePipeline, { $count: "total" }];
        let countResult = await ProductModel.aggregate(countPipeline);
        let count = countResult.length > 0 ? countResult[0].total : 0;

        subCatePipeline.push({ $sort: sortStage });
        subCatePipeline.push({ $skip: pagination.skip });
        subCatePipeline.push({ $limit: pagination.limit });
        subCatePipeline.push({
          $project: {
            files: 1,
            name: 1,
            description: 1,
            discount: 1,
            grandTotal: 1,
            title: 1,
            slug: 1,
            discountValue: 1,
            label: 1,
            tag: 1,
            totalCost: 1,
            availability: 1,
            "subCategory._id": 1,
            "subCategory.title": 1,
            "subCategory.url": 1,
            "subCategory.slug": 1,
            "subCategory.type": 1,
            cost: 1,
          },
        });

        const result = await ProductModel.aggregate(subCatePipeline).exec();

        let paginationData = paginationDetails({
          limit: pagination.limit,
          page: req.query.page,
          totalItems: count,
        });
        return successResponse({
          res,
          statusCode: 200,
          pagination: paginationData,
          data: result,
          message: "Products retrieved successfully.",
        });
      }

      if (matchStage) {
        const pagination = paginationFun(req.query);
        let count;

        count = await ProductModel.countDocuments(matchStage);
        const result = await ProductModel.find(matchStage)
          .sort(sortStage)
          .skip(pagination.skip)
          .limit(pagination.limit)
          .populate({ path: "category", select: "title slug url" })
          .populate({ path: "subCategory", select: "title slug type url" })
          .select(
            "title files availability name description subCategory category label tag slug grandTotal totalCost discountValue cost",
          );
        let paginationData = paginationDetails({
          limit: pagination.limit,
          page: req.query.page,
          totalItems: count,
        });
        return successResponse({
          res,
          statusCode: 200,
          pagination: paginationData,
          data: result,
          message: "Products retrieved successfully.",
        });
      }
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "product.getProductDetails",
      });
    }
  };

  /**
   * get details
   */
  static getProductDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const matchStage = {};
      const { slug, manager } = req.query;

      if (id) matchStage._id = new mongoose.Types.ObjectId(id);
      if (manager) filter.createdBy = new mongoose.Types.ObjectId(manager);
      if (slug) matchStage.slug = { $regex: new RegExp(`^${slug}$`, "i") };

      const pagination = paginationFun(req.query);
      let count, paginationData;

      count = await ProductModel.countDocuments(matchStage);

      const result = await Services.getProductDetails(matchStage, pagination);
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
        message: "Products retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "product.getProductDetails",
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
        subTotal,
        search,
        metalColor,
        sort,
        purity,
        attName,
        shopFor,
        minQuantity,
        expiresOn,
        maxQuantity,
        minSales,
        maxSales,
        draft,
        category,
        subCategory,
        manager,
        availability,
        slug,
      } = req.query;

      const matchStage = {};

      if (id) matchStage._id = new mongoose.Types.ObjectId(id);
      if (category) matchStage.category = new mongoose.Types.ObjectId(category);
      if (subCategory)
        matchStage.subCategory = new mongoose.Types.ObjectId(subCategory);
      if (manager) filter.createdBy = new mongoose.Types.ObjectId(manager);
      if (slug) matchStage.slug = { $regex: new RegExp(`^${slug}$`, "i") };
      if (purity) matchStage.purity = parseFloat(purity);
      if (metalColor)
        matchStage.metalColor = { $regex: `^${metalColor}$`, $options: "i" };
      if (shopFor)
        matchStage.shopFor = { $regex: `^${shopFor}$`, $options: "i" };
      if (subTotal) matchStage.subTotal = parseFloat(subTotal);
      if (draft !== undefined) matchStage.isDraft = draft === "true";
      if (availability !== undefined)
        matchStage.availability = availability === "true";
      if (expiresOn)
        matchStage.expiresOn = { $regex: `^${expiresOn}$`, $options: "i" };
      if (attName) {
        matchStage.attributes = {
          $elemMatch: { attName: { $regex: `^${attName}$`, $options: "i" } },
        };
      }

      if (minQuantity !== undefined || maxQuantity !== undefined) {
        matchStage.quantity = {};
        if (minQuantity !== undefined)
          matchStage.quantity.$gte = parseInt(minQuantity);
        if (maxQuantity !== undefined)
          matchStage.quantity.$lte = parseInt(maxQuantity);
      }

      if (minSales !== undefined || maxSales !== undefined) {
        matchStage.sales = {};
        if (minSales !== undefined) matchStage.sales.$gte = parseInt(minSales);
        if (maxSales !== undefined) matchStage.sales.$lte = parseInt(maxSales);
      }

      if (search) {
        matchStage.$or = [
          { title: { $regex: search, $options: "i" } },
          { sku: { $regex: search, $options: "i" } },
        ];
      }

      const pagination = paginationFun(req.query);
      let count, paginationData;

      count = await ProductModel.countDocuments(matchStage);

      /**sort data */
      let sortStage = {};
      if (sort) {
        if (sort === "price_asc") {
          sortStage.grandTotal = 1;
        } else if (sort === "price_dec") {
          sortStage.grandTotal = -1;
        } else if (sort === "newest") {
          sortStage.createdAt = -1;
        }
      } else {
        sortStage = { createdAt: -1 };
      }

      const result = await Services.getByAdmin(
        matchStage,
        sortStage,
        pagination,
      );
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
        message: "Products retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "product.getByAdmin",
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
      const {
        name,
        description,
        manufacturerName,
        tag,
        occasion,
        shopFor,
        material,
        collections,
        giftType,
        metalColor,
        purity,
        weight,
        length,
        width,
        height,
        size,
        range,
        isDraft,
        hasVariant,
        isRing,
        isFeatured,
        cost,
        ratePerGram,
        costWeight,
        metal,
        amount,
        costDiscount,
        saveCost,
        costType,
        costDiscountType,
        attributes,
        attTitle,
        settingType,
        attWeight,
        attName,
        number,
        discountDescription,
        title,
        price,
        quantity,
        sales,
        rating,
        expiresOn,
        label,
        availability,
      } = req.body;

      let {
        taxValue,
        taxAmount,
        discountType,
        discountValue,
        savedAmount,
        totalCost,
      } = req.body;

      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return errorResponse({
          res,
          statusCode: 404,
          error: new Error("Product not found."),
        });
      }

      let subTotal = price || existingProduct.price || 0;

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

      if (existingProduct.cost && existingProduct.cost.length > 0) {
        existingProduct.cost.forEach((item) => {
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
        discountType = existingProduct.discountType;
      }

      if (discountValue) {
        ({ newSubTotal: subTotal, savedAmount } = applyDiscount(
          discountValue,
          discountType,
        ));
      } else if (
        existingProduct.discountValue &&
        existingProduct.discountType
      ) {
        ({ newSubTotal: subTotal, savedAmount } = applyDiscount(
          existingProduct.discountValue,
          existingProduct.discountType,
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

      const updatedFiles = await updateMultipleFiles(
        req,
        existingProduct,
        folderName,
      );
      const slug = title
        ? slugify(title, { lower: true })
        : existingProduct.slug;

      const doc = {
        name,
        metal,
        description,
        manufacturerName,
        tag,
        occasion,
        shopFor,
        material,
        collections,
        giftType,
        metalColor,
        purity,
        label,
        createdBy: userId,
        weight,
        length,
        width,
        height,
        size,
        range,
        isDraft,
        hasVariant,
        isRing,
        isFeatured,
        cost,
        ratePerGram,
        costWeight,
        metal,
        amount,
        costDiscount,
        saveCost,
        costType,
        costDiscountType,
        attributes,
        attTitle,
        settingType,
        attWeight,
        attName,
        number,
        discountDescription,
        quantity,
        sales,
        rating,
        savedAmount,
        discountValue,
        price,
        taxValue,
        totalCost,
        files: updatedFiles,
        grandTotal,
        subTotal,
        slug,
        title,
        discountType,
        taxAmount,
        attributes: attributes
          ? [...existingProduct.attributes, ...attributes]
          : existingProduct.attributes,
        expiresOn,
        cost: cost ? [...existingProduct.cost, ...cost] : existingProduct.cost,
        tag,
        availability,
      };

      const result = await Services.update(id, doc);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Product updated successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "product.update",
      });
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
      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Product not found"),
        });
      }

      const costIndex = existingProduct.cost.findIndex(
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
          existingProduct.cost[costIndex][field] = updatedFields[field];
        }
      });

      subTotal = existingProduct.price;
      if (existingProduct.cost) {
        await Promise.all(
          existingProduct.cost.map(async (item) => {
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
          existingProduct.cost.reduce((acc, item) => acc + item.totalCost, 0) +
            existingProduct.price || 0;
      }

      totalCost = subTotal;
      if (existingProduct.discountValue && existingProduct.discountType) {
        if (existingProduct.discountType === discountTypeEnum.AMOUNT) {
          subTotal -= existingProduct.discountValue;
          savedAmount = existingProduct.discountValue;
        }

        if (existingProduct.discountType === discountTypeEnum.PERCENTAGE) {
          savedAmount = (subTotal * existingProduct.discountValue) / 100;
          subTotal = subTotal - savedAmount;
        }
      }

      let grandTotal = subTotal;
      if (existingProduct.taxValue) {
        grandTotal += (subTotal * parseFloat(existingProduct.taxValue)) / 100;
      }

      totalCost = Math.floor(totalCost);
      subTotal = Math.floor(subTotal);
      grandTotal = Math.floor(grandTotal);

      existingProduct.subTotal = subTotal;
      existingProduct.totalCost = totalCost;
      existingProduct.grandTotal = grandTotal;
      existingProduct.savedAmount = savedAmount;

      await existingProduct.save();
      return successResponse({
        res,
        statusCode: 200,
        data: existingProduct,
        message: "Product cost updated successfully",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "product.updateCost" });
    }
  };

  /**
   * update attributes
   */
  static updateAttribute = async (req, res) => {
    try {
      const { id, attributeId } = req.params;
      const { attTitle, attName, settingType, attWeight, number } = req.body;

      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Product not found"),
        });
      }

      const attIndex = existingProduct.attributes.findIndex(
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
        existingProduct.attributes[attIndex].attTitle = attTitle;
      }
      if (attName) {
        existingProduct.attributes[attIndex].attName = attName;
      }
      if (settingType) {
        existingProduct.attributes[attIndex].settingType = settingType;
      }
      if (attWeight) {
        existingProduct.attributes[attIndex].attWeight = attWeight;
      }
      if (number) {
        existingProduct.attributes[attIndex].number = number;
      }

      await existingProduct.save();
      return successResponse({
        res,
        statusCode: 200,
        data: existingProduct,
        message: "Attribute is updated successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "product.updateAttribute" });
    }
  };

  /**
   * delete single file
   */
  static deleteSingleFile = async (req, res) => {
    try {
      const { id, fileId } = req.params;

      const product = await ProductModel.findById(id);
      if (!product) {
        return errorResponse({
          res,
          statusCode: 404,
          error: new Error("Product not found."),
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

      if (product.files && product.files.length > 0) {
        deleteFromImages(product.files);
      }

      if (!fileDeleted && product.filename && product.urls.length > 0) {
        deleteFromImages(product.urls);
      }

      if (!fileDeleted) {
        return errorResponse({
          res,
          statusCode: 404,
          error: new Error("File not found."),
        });
      }

      await product.save();
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

      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Product not found"),
        });
      }

      const costIndex = existingProduct.cost.findIndex(
        (cost) => cost._id.toString() === costId,
      );
      if (costIndex === -1) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Cost not found"),
        });
      }

      existingProduct.cost.splice(costIndex, 1);
      let subTotal = existingProduct.price;

      existingProduct.cost.forEach((cost) => {
        subTotal += cost.totalCost;
      });

      totalCost = subTotal;

      if (existingProduct.discountValue && existingProduct.discountType) {
        if (existingProduct.discountType === discountTypeEnum.AMOUNT) {
          subTotal -= existingProduct.discountValue;
          savedAmount = existingProduct.discountValue;
        }

        if (existingProduct.discountType === discountTypeEnum.PERCENTAGE) {
          savedAmount = (subTotal * existingProduct.discountValue) / 100;
          subTotal = subTotal - savedAmount;
        }
      }

      let grandTotal = subTotal;

      if (existingProduct.taxValue) {
        grandTotal += (subTotal * parseFloat(existingProduct.taxValue)) / 100;
      }

      totalCost = Math.floor(totalCost);
      subTotal = Math.floor(subTotal);
      grandTotal = Math.floor(grandTotal);

      existingProduct.subTotal = subTotal;
      existingProduct.totalCost = totalCost;
      existingProduct.grandTotal = grandTotal;
      existingProduct.savedAmount = savedAmount;

      await existingProduct.save();

      return res.json({
        success: true,
        message: "Cost removed successfully",
        data: existingProduct,
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "product.removeCost" });
    }
  };

  /**
   * remove attribute
   */
  static removeAttribute = async (req, res) => {
    try {
      const { id, attributeId } = req.params;

      const existingProduct = await ProductModel.findById(id);
      if (!existingProduct) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Product not found"),
        });
      }

      const attIndex = existingProduct.attributes.findIndex(
        (attributes) => attributes._id.toString() === attributeId,
      );
      if (attIndex === -1) {
        return errorResponse({
          res,
          statusCode: 404,
          error: Error("Attribute not found"),
        });
      }
      existingProduct.attributes.splice(attIndex, 1);
      await existingProduct.save();

      return successResponse({
        res,
        statusCode: 200,
        message: "Attribute is remove successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "product.removeAttribute" });
    }
  };
}

export default controller;
