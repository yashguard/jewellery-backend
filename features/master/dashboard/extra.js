import { errorResponse, successResponse } from "../../../helper/apiResponse.js";
import ProductModel from "../product/model.js";
import AuthModel from "../../authentication/model.js";
import OrderModel from "../../orders/model.js";
import {
  appointmentStatusEnum,
  contactStatusEnum,
  orderStatusEnum,
  userRoleEnum,
} from "../../../config/enum.js";
import AppointmentModel from "../../appointment/model.js";
import ContactUsModel from "../../contactUs/model.js";
import CategoryModel from "../category/model.js";
import SubcategoryModel from "../subCategory/model.js";
import ProductVariantModel from "../productVariants/model.js";
import CouponModel from "../coupon/model.js";
import BlogModel from "../blog/model.js";
import { io } from "../../../index.js";

class controller {
  /**
   * search api
   */
  static search = async (req, res) => {
    try {
      const { query } = req.query;

      let categoryFilter = {
        $or: [
          { title: { $regex: new RegExp(`^${query}$`, "i") } },
          { slug: { $regex: new RegExp(`^${query}$`, "i") } },
          { "subcategories.title": { $regex: new RegExp(`^${query}$`, "i") } },
          { "subcategories.slug": { $regex: new RegExp(`^${query}$`, "i") } },
        ],
      };

      const categories = await CategoryModel.find(categoryFilter);
      let productFilter = {
        $or: [
          { title: { $regex: new RegExp(`^${query}$`, "i") } },
          { sku: { $regex: new RegExp(`^${query}$`, "i") } },
          { name: { $regex: new RegExp(`^${query}$`, "i") } },
          { shopFor: { $regex: new RegExp(`^${query}$`, "i") } },
          { slug: { $regex: new RegExp(`^${query}$`, "i") } },
          { purity: { $regex: new RegExp(`^${query}$`, "i") } },
          { weight: { $regex: new RegExp(`^${query}$`, "i") } },
          {
            attributes: {
              $elemMatch: {
                attName: { $regex: new RegExp(`^${query}$`, "i") },
              },
            },
          },
        ],
      };

      const products = await ProductModel.find(productFilter);
      let results = {
        categories,
        products,
      };

      return successResponse({
        res,
        statusCode: 200,
        data: results,
        message: "Search results retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "dashboard.search",
      });
    }
  };

  /**
   * Get by Admin
   */
  static getByAdmin = async (req, res) => {
    try {
      const [
        coupons,
        categories,
        subcategories,
        blogs,
        contactUs,
        getAppointment,
        productsCount,
        deliveredOrder,
        productSalesCount,
        lowStockProductsCount,
        customersCount,
        totalOrders,
        topSellers,
        refundedOrders,
        topSellingProducts,
      ] = await Promise.all([
        CouponModel.countDocuments({}),
        CategoryModel.countDocuments({}),
        SubcategoryModel.countDocuments({}),
        BlogModel.countDocuments({}),
        ContactUsModel.countDocuments({}),
        AppointmentModel.countDocuments({ status: "pending" }),
        ProductModel.countDocuments({}),
        OrderModel.countDocuments({ status: "delivered" }),
        ProductModel.countDocuments({ sales: { $gt: 0 } }),
        ProductModel.aggregate([
          { $match: { quantity: { $lt: 10 } } },
          { $limit: 5 },
          { $group: { _id: "$_id", totalSales: { $sum: "$sales" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              productName: "$productDetails.name",
              totalSales: 1,
              quantity: "$productDetails.quantity",
              sku: "$productDetails.sku",
              totalRevenue: {
                $trunc: {
                  $multiply: ["$totalSales", "$productDetails.grandTotal"],
                },
              },
            },
          },
        ]),
        AuthModel.countDocuments({ role: userRoleEnum.CUSTOMER }),
        OrderModel.countDocuments({}),
        OrderModel.aggregate([
          { $match: { status: "delivered" } },
          { $group: { _id: "$sellBy", totalSales: { $sum: "$totalAmount" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "sellBy",
            },
          },
          { $unwind: "$sellBy" },
          {
            $project: {
              sellerName: "$sellBy.username",
              totalSales: 1,
            },
          },
        ]),
        OrderModel.countDocuments({ status: "refunded" }),
        ProductModel.aggregate([
          { $match: { sales: { $gt: 100 } } },
          { $limit: 10 },
          { $group: { _id: "$_id", totalSales: { $sum: "$sales" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              productName: "$productDetails.name",
              totalSales: 1,
              sku: "$productDetails.sku",
              files: "$productDetails.files",
              grandTotal: "$productDetails.grandTotal",
              totalRevenue: {
                $trunc: {
                  $multiply: ["$totalSales", "$productDetails.grandTotal"],
                },
              },
            },
          },
        ]),
      ]);

      io.emit("adminDashboard", {
        coupons,
        categories,
        subcategories,
        blogs,
        contactUs,
        getAppointment,
        productsCount,
        deliveredOrder,
        productSalesCount,
        lowStockProductsCount,
        customersCount,
        totalOrders,
        topSellers,
        refundedOrders,
        topSellingProducts,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: {
          coupons,
          categories,
          subcategories,
          blogs,
          contactUs,
          getAppointment,
          productsCount,
          deliveredOrder,
          productSalesCount,
          lowStockProductsCount,
          customersCount,
          totalOrders,
          topSellers,
          refundedOrders,
          topSellingProducts,
        },
        message: "Dashboard retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "dashboard.getByAdmin",
      });
    }
  };

  /**
   * Get by Manager
   */
  static getByManager = async (req, res) => {
    try {
      const pendingApp = await AppointmentModel.countDocuments({
        status: appointmentStatusEnum.PENDING,
      });
      const confirmApp = await AppointmentModel.countDocuments({
        status: appointmentStatusEnum.CONFIRM,
      });
      const cancelApp = await AppointmentModel.countDocuments({
        status: appointmentStatusEnum.CANCEL,
      });
      const completedApp = await AppointmentModel.countDocuments({
        status: appointmentStatusEnum.COMPLETED,
      });
      const pendingCon = await ContactUsModel.countDocuments({
        status: contactStatusEnum.PENDING,
      });
      const completedCon = await ContactUsModel.countDocuments({
        status: contactStatusEnum.COMPLETED,
      });
      const cancelCon = await ContactUsModel.countDocuments({
        status: contactStatusEnum.CANCELLED,
      });

      io.emit("managerDashboard", {
        appointment: {
          pendingApp,
          confirmApp,
          cancelApp,
          completedApp,
        },
        contact: {
          pendingCon,
          completedCon,
          cancelCon,
        },
      });

      return successResponse({
        res,
        statusCode: 200,
        data: {
          appointment: {
            pendingApp,
            confirmApp,
            cancelApp,
            completedApp,
          },
          contact: {
            pendingCon,
            completedCon,
            cancelCon,
          },
        },
        message: "Dashboard retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "dashboard.getByManager",
      });
    }
  };

  /**
   * Get by Seller
   */
  static getBySeller = async (req, res) => {
    try {
      const [
        productsCount,
        pendingOrders,
        processingOrders,
        cancelOrders,
        pickedOrders,
        placedOrders,
        shipOrders,
        deliveredOrder,
        returnOrder,
        refunds,
        productSalesCount,
        lowStockProductsCount,
        customersCount,
        totalOrders,
        topSellers,
        refundedOrders,
        topSellingProducts,
      ] = await Promise.all([
        ProductModel.countDocuments({}),
        OrderModel.countDocuments({ status: orderStatusEnum.PENDING }),
        OrderModel.countDocuments({ status: orderStatusEnum.PROCESSING }),
        OrderModel.countDocuments({ status: orderStatusEnum.CANCEL }),
        OrderModel.countDocuments({ status: orderStatusEnum.PICKED }),
        OrderModel.countDocuments({ status: orderStatusEnum.PLACED }),
        OrderModel.countDocuments({ status: orderStatusEnum.SHIPPING }),
        OrderModel.countDocuments({ status: orderStatusEnum.DELIVERED }),
        OrderModel.countDocuments({ status: orderStatusEnum.RETURNED }),
        OrderModel.countDocuments({ status: orderStatusEnum.REFUNDED }),
        ProductModel.countDocuments({ sales: { $gt: 0 } }),
        ProductModel.aggregate([
          { $match: { quantity: { $lt: 10 } } },
          { $limit: 5 },
          { $group: { _id: "$_id", totalSales: { $sum: "$sales" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              productName: "$productDetails.name",
              totalSales: 1,
              quantity: "$productDetails.quantity",
              sku: "$productDetails.sku",
              totalRevenue: {
                $trunc: {
                  $multiply: ["$totalSales", "$productDetails.grandTotal"],
                },
              },
            },
          },
        ]),
        AuthModel.countDocuments({ role: userRoleEnum.CUSTOMER }),
        OrderModel.countDocuments({}),
        OrderModel.aggregate([
          { $match: { status: "delivered" } },
          { $group: { _id: "$sellBy", totalSales: { $sum: "$totalAmount" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "sellBy",
            },
          },
          { $unwind: "$sellBy" },
          {
            $project: {
              sellerName: "$sellBy.username",
              totalSales: 1,
            },
          },
        ]),
        OrderModel.countDocuments({ status: "refunded" }),
        ProductModel.aggregate([
          { $match: { sales: { $gt: 100 } } },
          { $limit: 10 },
          { $group: { _id: "$_id", totalSales: { $sum: "$sales" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              productName: "$productDetails.name",
              totalSales: 1,
              sku: "$productDetails.sku",
              files: "$productDetails.files",
              grandTotal: "$productDetails.grandTotal",
              totalRevenue: {
                $trunc: {
                  $multiply: ["$totalSales", "$productDetails.grandTotal"],
                },
              },
            },
          },
        ]),
      ]);

      io.emit("sellerDashboard", {
        productsCount,
        pendingOrders,
        processingOrders,
        cancelOrders,
        pickedOrders,
        placedOrders,
        shipOrders,
        deliveredOrder,
        returnOrder,
        refunds,
        productSalesCount,
        lowStockProductsCount,
        customersCount,
        totalOrders,
        topSellers,
        refundedOrders,
        topSellingProducts,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: {
          productsCount,
          pendingOrders,
          processingOrders,
          cancelOrders,
          pickedOrders,
          placedOrders,
          shipOrders,
          deliveredOrder,
          returnOrder,
          refunds,
          productSalesCount,
          lowStockProductsCount,
          customersCount,
          totalOrders,
          topSellers,
          refundedOrders,
          topSellingProducts,
        },
        message: "Dashboard retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "dashboard.getBySeller",
      });
    }
  };

  /**
   * Get by Product Manager
   */
  static getByProductManager = async (req, res) => {
    try {
      const [
        coupon,
        latestPro,
        taxablePro,
        totalProducts,
        categoryCount,
        subcategoryCount,
        isDraftTrue,
        isDraftFalse,
        productSalesCount,
        lowStockProducts,
        customersCount,
        totalOrders,
        topSellers,
        refundedOrders,
        topSellingProducts,
        topSellingVariants,
      ] = await Promise.all([
        CouponModel.countDocuments({}),
        ProductModel.aggregate([
          { $sort: { createdAt: -1 } },
          { $limit: 2 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              productName: "$productDetails.name",
              totalSales: 1,
              sku: "$productDetails.sku",
              files: "$productDetails.files",
              quantity: "$productDetails.quantity",
              sales: "$productDetails.sales",
              grandTotal: "$productDetails.grandTotal",
            },
          },
        ]),
        ProductModel.countDocuments({ taxValue: { $gt: 1 } }),
        ProductModel.countDocuments({}),
        CategoryModel.countDocuments({}),
        SubcategoryModel.countDocuments({}),
        ProductModel.countDocuments({ isDraft: true }),
        ProductModel.countDocuments({ isDraft: false }),
        ProductModel.countDocuments({ sales: { $gt: 0 } }),
        ProductModel.aggregate([
          { $match: { quantity: { $lt: 10 } } },
          { $limit: 5 },
          { $group: { _id: "$_id", totalSales: { $sum: "$sales" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              productName: "$productDetails.name",
              totalSales: 1,
              quantity: "$productDetails.quantity",
              sku: "$productDetails.sku",
              totalRevenue: {
                $trunc: {
                  $multiply: ["$totalSales", "$productDetails.grandTotal"],
                },
              },
            },
          },
        ]),
        AuthModel.countDocuments({ role: userRoleEnum.CUSTOMER }),
        OrderModel.countDocuments({}),
        OrderModel.aggregate([
          { $match: { status: "delivered" } },
          { $group: { _id: "$sellBy", amount: { $sum: "$totalAmount" } } },
          { $sort: { amount: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "users",
              localField: "_id",
              foreignField: "_id",
              as: "sellBy",
            },
          },
          { $unwind: "$sellBy" },
          {
            $project: {
              sellerName: "$sellBy.username",
              amount: 1,
            },
          },
        ]),
        OrderModel.countDocuments({ status: "refunded" }),
        ProductModel.aggregate([
          { $match: { sales: { $gt: 100 } } },
          { $limit: 10 },
          { $group: { _id: "$_id", totalSales: { $sum: "$sales" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "products",
              localField: "_id",
              foreignField: "_id",
              as: "productDetails",
            },
          },
          { $unwind: "$productDetails" },
          {
            $project: {
              productName: "$productDetails.name",
              totalSales: 1,
              sku: "$productDetails.sku",
              files: "$productDetails.files",
              grandTotal: "$productDetails.grandTotal",
              totalRevenue: {
                $trunc: {
                  $multiply: ["$totalSales", "$productDetails.grandTotal"],
                },
              },
            },
          },
        ]),
        ProductVariantModel.aggregate([
          { $match: { sales: { $gt: 100 } } },
          { $limit: 10 },
          { $group: { _id: "$_id", totalSales: { $sum: "$sales" } } },
          { $sort: { totalSales: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: "productvariants",
              localField: "_id",
              foreignField: "_id",
              as: "variantDetails",
            },
          },
          { $unwind: "$variantDetails" },
          {
            $project: {
              productName: "$variantDetails.name",
              totalSales: 1,
              sku: "$variantDetails.sku",
              files: "$variantDetails.files",
              grandTotal: "$variantDetails.grandTotal",
              totalRevenue: {
                $trunc: {
                  $multiply: ["$totalSales", "$variantDetails.grandTotal"],
                },
              },
            },
          },
        ]),
      ]);

      io.emit("productManagerDashboard", {
        coupon,
        latestPro,
        taxablePro,
        totalProducts,
        categoryCount,
        subcategoryCount,
        isDraftTrue,
        isDraftFalse,
        productSalesCount,
        lowStockProducts,
        customersCount,
        totalOrders,
        topSellers,
        refundedOrders,
        topSellingProducts,
        topSellingVariants,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: {
          coupon,
          latestPro,
          taxablePro,
          totalProducts,
          categoryCount,
          subcategoryCount,
          isDraftTrue,
          isDraftFalse,
          productSalesCount,
          lowStockProducts,
          customersCount,
          totalOrders,
          topSellers,
          refundedOrders,
          topSellingProducts,
          topSellingVariants,
        },
        message: "Dashboard retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "dashboard.getByProductManager",
      });
    }
  };

  /**
   * Get by Content Editor
   */
  static getByContentEditor = async (req, res) => {
    try {
      const [blogs, users] = await Promise.all([
        BlogModel.countDocuments({}),
        AuthModel.countDocuments({ role: userRoleEnum.CUSTOMER }),
      ]);

      io.emit("contentEditorDashboard", {
        blogs,
        users,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: {
          blogs,
          users,
        },
        message: "Dashboard retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "dashboard.getByContentEditor",
      });
    }
  };

  /**
   * Get by Customer Service
   */
  static getByCustomerService = async (req, res) => {
    try {
      const [users] = await Promise.all([
        AuthModel.countDocuments({ role: userRoleEnum.CUSTOMER }),
      ]);

      io.emit("customerService", {
        users,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: { users },
        message: "Dashboard retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "dashboard.getByCustomerService",
      });
    }
  };
}

export default controller;
