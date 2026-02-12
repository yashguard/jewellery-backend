import express from "express";
import cors from "cors";
import { config } from "./config/config.js";
import { connectDB } from "./helper/dbConnection.js";
import * as route from "./router.js";

const app = express();

/** Connect database */
connectDB();

/** CORS */

app.use(
  cors({
    origin: "*", // Allow all origins
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));

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

/**master table routes */
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

/** Server running */
app.listen(config.port, () => {
  console.log(`Server is running on port http://localhost:${config.port}`);
});

/** Uncaught exceptions and unhandled rejections */
process.on("uncaughtException", function (err) {
  console.error("Uncaught Exception:", err.message);
});
process.on("unhandledRejection", function (err) {
  console.error("Unhandled Rejection:", err.message);
});
