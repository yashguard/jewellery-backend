import { errorResponse, successResponse } from "../../../helper/apiResponse.js";
import ProductModel from "../product/model.js";
import AuthModel from "../../authentication/model.js";
import OrderModel from "../../orders/model.js";
import {
  appointmentStatusEnum,
  contactStatusEnum,
  orderStatusEnum,
  paymentStatusEnum,
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
import PaymentModel from "../../payment/model.js";
import ProductReviewModel from "../../productReview/model.js";

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
        totalEarning,
        totalOrders,
        totalCustomers,
        refundOrders,
        completedOrders,
        pendingOrders,
        orderRefund,
        totalProductReviews,
        reviewDetails,
        bestSellingProducts,
        recentOrders,
        monthlySalesOverview,
        customerOverview,
      ] = await Promise.all([
        PaymentModel.aggregate([
          {
            $match: { status: paymentStatusEnum.COMPLETED },
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$amount" },
            },
          },
          {
            $project: {
              _id: 0,
              totalAmount: 1,
            },
          },
        ]).then((res) => (res.length > 0 ? res[0].totalAmount : 0)),
        OrderModel.countDocuments(),
        AuthModel.countDocuments({ role: userRoleEnum.CUSTOMER }),
        PaymentModel.countDocuments({ status: paymentStatusEnum.REFUNDED }),
        OrderModel.countDocuments({ status: orderStatusEnum.DELIVERED }),
        OrderModel.countDocuments({ status: orderStatusEnum.PENDING }),
        OrderModel.countDocuments({ status: orderStatusEnum.REFUNDED }),
        ProductReviewModel.countDocuments(),
        ProductReviewModel.find({ rating: { $in: [5, 4.5] } })
          .populate({ path: "user", select: "username url customerId" })
          .select("message rating createdAt user")
          .limit(3)
          .sort({ createdAt: -1 }),
        ProductModel.find({ sales: { $gt: 1 } })
          .select("sku slug title files grandTotal quantity sales availability")
          .sort({ sales: -1 })
          .limit(25),
        OrderModel.find()
          .populate({ path: "user", select: "username url customerId email" })
          .select("createdAt orderId user items totalAmount isPaid status")
          .sort({ createdAt: -1 })
          .limit(25),
        PaymentModel.aggregate([
          {
            $facet: {
              monthlyEarnings: [
                { $match: { status: paymentStatusEnum.COMPLETED } },
                {
                  $group: {
                    _id: { month: { $month: "$createdAt" } },
                    earning: { $sum: "$amount" },
                  },
                },
                { $sort: { "_id.month": 1 } },
                {
                  $project: {
                    month: "$_id.month",
                    earning: 1,
                    _id: 0,
                  },
                },
              ],
              monthlyRefunds: [
                { $match: { status: paymentStatusEnum.REFUNDED } },
                {
                  $group: {
                    _id: { month: { $month: "$createdAt" } },
                    refunded: { $sum: "$amount" },
                  },
                },
                { $sort: { "_id.month": 1 } },
                {
                  $project: {
                    month: "$_id.month",
                    refunded: 1,
                    _id: 0,
                  },
                },
              ],
              customerCounts: [
                {
                  $group: {
                    _id: { month: { $month: "$createdAt" } },
                    customer: { $sum: 1 },
                  },
                },
                { $sort: { "_id.month": 1 } },
                {
                  $project: {
                    month: "$_id.month",
                    customer: 1,
                    _id: 0,
                  },
                },
              ],
            },
          },
          {
            $project: {
              monthlyEarnings: 1,
              monthlyRefunds: 1,
              customerCounts: 1,
            },
          },
        ]),
        AuthModel.aggregate([
          { $match: { role: userRoleEnum.CUSTOMER } },
          {
            $group: {
              _id: {
                month: { $month: "$createdAt" },
                year: { $year: "$createdAt" },
              },
              totalCustomers: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              month: "$_id.month",
              year: "$_id.year",
              totalCustomers: 1,
            },
          },
          { $sort: { year: 1, month: 1 } },
        ]),
      ]);

      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const monthlySalesOverviewObj = Array.from({ length: 12 }, (_, i) => ({
        month: monthNames[i],
        earning: 0,
        customer: 0,
        refunded: 0,
      }));

      monthlySalesOverview.forEach(
        ({ monthlyEarnings, monthlyRefunds, customerCounts }) => {
          monthlyEarnings.forEach((earning) => {
            monthlySalesOverviewObj[earning.month - 1].earning =
              earning.earning;
          });
          monthlyRefunds.forEach((refund) => {
            monthlySalesOverviewObj[refund.month - 1].refunded =
              refund.refunded;
          });
          customerCounts.forEach((customer) => {
            monthlySalesOverviewObj[customer.month - 1].customer =
              customer.customer;
          });
        }
      );

      const customerOverviewMonthlyCounts = customerOverview.reduce(
        (acc, curr) => {
          const { month, year, totalCustomers } = curr;
          const monthIndex =
            (year - new Date().getFullYear()) * 12 + (month - 1);
          if (monthIndex >= 0 && monthIndex < 12) {
            acc[monthIndex].customer = totalCustomers;
          }
          return acc;
        },
        monthlySalesOverviewObj
      );

      const completedOrdersPercentage =
        totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
      const pendingOrdersPercentage =
        totalOrders > 0 ? (pendingOrders / totalOrders) * 100 : 0;
      const orderRefundPercentage =
        totalOrders > 0 ? (orderRefund / totalOrders) * 100 : 0;

      const dashboardData = {
        totalEarning,
        totalOrders,
        totalCustomers,
        refundOrders,
        completedOrders: {
          count: completedOrders,
          percentage: completedOrdersPercentage.toFixed(2),
        },
        pendingOrders: {
          count: pendingOrders,
          percentage: pendingOrdersPercentage.toFixed(2),
        },
        orderRefund: {
          count: orderRefund,
          percentage: orderRefundPercentage.toFixed(2),
        },
        totalProductReviews,
        reviewDetails,
        bestSellingProducts,
        recentOrders,
        monthlySalesOverview: customerOverviewMonthlyCounts,
      };

      io.emit("adminDashboard", {
        totalEarning,
        totalOrders,
        totalCustomers,
        refundOrders,
        completedOrders,
        pendingOrders,
        orderRefund,
        totalProductReviews,
        reviewDetails,
        bestSellingProducts,
        recentOrders,
        monthlySalesOverview: customerOverviewMonthlyCounts,
      });

      return successResponse({
        res,
        statusCode: 200,
        data: dashboardData,
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
