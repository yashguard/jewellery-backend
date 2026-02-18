import express from "express";
import cors from "cors";
import http from "http";
import * as route from "./router.js";
import { config } from "./config/config.js";
import { connectDB } from "./helper/dbConnection.js";
import { Server as SocketIOServer } from "socket.io";
import CouponModel from "./features/master/coupon/model.js";
import CategoryModel from "./features/master/category/model.js";
import SubcategoryModel from "./features/master/subCategory/model.js";
import BlogModel from "./features/master/blog/model.js";
import ContactUsModel from "./features/contactUs/model.js";
import AppointmentModel from "./features/appointment/model.js";
import ProductModel from "./features/master/product/model.js";
import OrderModel from "./features/orders/model.js";
import AuthModel from "./features/authentication/model.js";
import {
  appointmentStatusEnum,
  contactStatusEnum,
  orderStatusEnum,
  paymentStatusEnum,
  userRoleEnum,
} from "./config/enum.js";
import ProductVariantModel from "./features/master/productVariants/model.js";
import ProductReviewModel from "./features/productReview/model.js";
import PaymentModel from "./features/payment/model.js";
import morgan from "morgan";

const app = express();
app.disable("x-powered-by");
app.use(morgan("dev"));

/** Connect database */
connectDB();

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://206.189.129.0:5173",
    methods: ["GET", "POST"],
  },
});

export { io };

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  /**
   * Admin Dashboard
   */
  socket.on("adminDashboardData", async () => {
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
        },
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
        monthlySalesOverviewObj,
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

      socket.emit("adminDashboard", {
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
    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Failed to retrieve dashboard data." });
    }
  });

  /**
   * Manager dashboard
   */
  socket.on("getManagerDashboard", async () => {
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

      socket.emit("managerDashboard", {
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
    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Failed to retrieve dashboard data." });
    }
  });

  /**
   * Seller Dashboard
   */
  socket.on("getSellerDashboard", async () => {
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

      socket.emit("sellerDashboard", {
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
    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Failed to retrieve dashboard data." });
    }
  });

  /**
   * Product Manager
   */
  socket.on("getProductManagerDashboard", async () => {
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

      socket.emit("productManagerDashboard", {
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
    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Failed to retrieve dashboard data." });
    }
  });

  /**
   * Content editor dashboard
   */
  socket.on("getContentEditorDashboard", async () => {
    try {
      const [blogs, users] = await Promise.all([
        BlogModel.countDocuments({}),
        AuthModel.countDocuments({ role: userRoleEnum.CUSTOMER }),
      ]);

      socket.emit("contentEditorDashboard", {
        blogs,
        users,
      });
    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Failed to retrieve dashboard data." });
    }
  });

  /**
   * Customer service dashboard
   */
  socket.on("getCustomerServiceDashboard", async () => {
    try {
      const [users] = await Promise.all([
        AuthModel.countDocuments({ role: userRoleEnum.CUSTOMER }),
      ]);

      socket.emit("customerService", {
        users,
      });
    } catch (error) {
      console.error(error);
      socket.emit("error", { message: "Failed to retrieve dashboard data." });
    }
  });

  /**socket disconnect */
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

/** CORS */
app.use(
  cors({
    origin: [config.client_url],
  }),
);

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.use("/api/health", (_, res) => {
  console.log("Health Check Call");
  res.status(200).json({ status: "OK", message: "Server is running" });
});

/**Routes */
app.use("/api/auth", route.authRoute);
app.use("/api/comments", route.commentRoute);
app.use("/api/contact-us", route.contactUsRoute);
app.use("/api/appointments", route.appointmentRoute);
app.use("/api/payments", route.paymentRoute);
app.use("/api/product-reviews", route.productReviewRoute);
app.use("/api/videoCall", route.videoCallRoute);
app.use("/api/wishlist", route.wishlistRoute);
app.use("/api/cart", route.cartRoute);
app.use("/api/coupon", route.couponRoute);
app.use("/api/orders", route.orderRoute);
app.use("/api/return-order", route.returnOrderRoute);

/**Master table routes */
app.use("/api/categories", route.categoryRoute);
app.use("/api/sub-categories", route.subcategoryRoute);
app.use("/api/banners", route.bannerRoute);
app.use("/api/blogs", route.blogRoute);
app.use("/api/faq", route.faqRoute);
app.use("/api/product", route.productRoute);
app.use("/api/variants", route.variantsRoute);
app.use("/api/enums", route.enumRoute);
app.use("/api/about-us", route.aboutUsRoute);
app.use("/api/filter", route.filterRoute);
app.use("/api/invoice", route.invoiceRoute);
app.use("/api/dashboard", route.dashboardRoute);
app.use("/api/price", route.priceRoute);
app.use("/api/home", route.homeRoute);
app.use("/api/tax", route.taxRoute);

/** Server running */
server.listen(config.port, () => {
  console.log(`Server is running on port http://localhost:${config.port}`);
});

/** Uncaught exceptions and unhandled rejections */
process.on("uncaughtException", function (err) {
  console.error("Uncaught Exception:", err.message);
});
process.on("unhandledRejection", function (err) {
  console.error("Unhandled Rejection:", err.message);
});
