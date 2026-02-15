import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import services from "./service.js";
import { config } from "../../config/config.js";
import { sendMail } from "../../helper/email.js";
import { OAuth2Client } from "google-auth-library";
import AuthModel from "../authentication/model.js";
import OrderModel from "../orders/model.js";
import {
  successResponse,
  errorResponse,
  validateResponse,
} from "../../helper/apiResponse.js";
import { generateToken } from "../../helper/common.js";
import { authProviderEnum, userRoleEnum } from "../../config/enum.js";
import { paginationFun, paginationDetails } from "../../helper/common.js";
import { updateFile, uploadSingleFile } from "../cloudinary/controller.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
const folderName = "user";

class controller {
  /**
   * Add staff
   */
  static addStaff = async (req, res) => {
    try {
      const {
        username,
        phone,
        email,
        role,
        joiningDate,
        empId,
        password,
        confirmPassword,
      } = req.body;

      if (empId) {
        const find = await AuthModel.findOne({ empId });
        if (find) {
          return errorResponse({
            res,
            statusCode: 400,
            error: Error("Employee ID already exists."),
          });
        }
      }

      if (email) {
        const find = await AuthModel.findOne({ email });
        if (find) {
          return errorResponse({
            res,
            statusCode: 400,
            error: Error("Email already exists."),
          });
        }
      }

      if (phone) {
        const find = await AuthModel.findOne({ phone });
        if (find) {
          return errorResponse({
            res,
            statusCode: 400,
            error: Error("Phone number already exists."),
          });
        }
      }

      if (password !== confirmPassword) {
        return errorResponse({
          res,
          statusCode: 400,
          error: Error("Password and confirm password does not match."),
        });
      }

      const hashPassword = await bcrypt.hash(password, 10);
      const doc = {
        username,
        phone,
        email,
        role,
        joiningDate,
        empId,
        password: hashPassword,
        authProvider: "local",
        isActive: true,
        isVerified: true,
      };

      const result = await AuthModel.create(doc);
      return successResponse({
        res,
        statusCode: 201,
        data: result,
        message: "Registration complete!",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "staff.addStaff",
      });
    }
  };

  /**
   * register
   */
  static register = async (req, res) => {
    try {
      const {
        username,
        password,
        email,
        phone,
        authProvider,
        connection,
        link,
        connectionType,
      } = req.body;
      console.log("cicd is working !");
      let role;
      const existingUser = await AuthModel.findOne({ email });
      if (existingUser) {
        return successResponse({
          res,
          statusCode: 400,
          message: "User already registered.",
        });
      }

      if (phone) {
        const find = await AuthModel.findOne({ phone });
        if (find) {
          return errorResponse({
            res,
            statusCode: 400,
            error: Error("Phone number already exists."),
          });
        }
      }

      if (email === config.admin.email) {
        role = userRoleEnum.ADMIN;
      }

      let url = await uploadSingleFile(req, folderName);
      let joiningDate = Date.now();
      const hashPassword = await bcrypt.hash(password, 10);

      let otp = Math.floor(1000 + Math.random() * 9000);
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + 30);

      let customerId;
      if (role !== userRoleEnum.ADMIN) {
        customerId = uuidv4();
      }

      const doc = {
        email,
        username,
        password: hashPassword,
        phone,
        role,
        otp,
        joiningDate,
        customerId,
        authProvider,
        url,
        otpExpiration: expiryTime,
        connection,
        link,
        connectionType,
      };

      if (authProvider === authProviderEnum.LOCAL) {
        await sendMail({
          to: email,
          subject: "Otp verification:",
          dynamicData: { otp },
          filename: "otpVerification.html",
        });
      }

      await services.registerService(doc);
      return successResponse({
        res,
        statusCode: 201,
        message:
          "Registration complete! Check your email for verification OTP.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "auth.register" });
    }
  };

  /**
   * otp verification
   */
  static otpVerification = async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await AuthModel.findOne({ email });
      if (!user) {
        return errorResponse({
          res,
          error: Error("User not found."),
          statusCode: 404,
        });
      }

      if (user.otpExpiration < new Date()) {
        return errorResponse({
          res,
          statusCode: 400,
          error: Error("OTP has expired."),
        });
      }

      if (user.otp === Number(otp)) {
        await AuthModel.updateOne(
          { _id: user._id },
          {
            $set: {
              otp: null,
              otpExpiration: null,
              isActive: true,
              isVerified: true,
            },
          },
        );
        return successResponse({
          res,
          statusCode: 200,
          message: "OTP verified successfully.",
        });
      } else {
        return errorResponse({
          res,
          statusCode: 400,
          error: Error("Invalid OTP."),
        });
      }
    } catch (error) {
      return errorResponse({ res, error, funName: "auth.otpVerification" });
    }
  };

  /**
   * resend otp
   */
  static resendOTP = async (req, res) => {
    try {
      const { email } = req.body;

      const user = await AuthModel.findOne({ email });
      if (!user) {
        return errorResponse({
          res,
          error: Error("User not found."),
          statusCode: 404,
        });
      }

      if (user.isVerified) {
        return errorResponse({
          res,
          statusCode: 400,
          error: Error("User is already verified."),
        });
      }

      const newOTP = Math.floor(1000 + Math.random() * 9000);
      const expiryTime = new Date();
      expiryTime.setSeconds(expiryTime.getSeconds() + 30);

      user.otp = newOTP;
      user.otpExpiration = expiryTime;
      await user.save();

      await sendMail({
        to: email,
        subject: "New OTP Verification Code:",
        dynamicData: { otp: newOTP },
        filename: "otpVerification.html",
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "New OTP sent successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "auth.resendOTP" });
    }
  };

  /**
   * login
   */
  static login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await AuthModel.findOne({ email });
      if (!user) {
        return errorResponse({
          res,
          error: new Error("Invalid credentials."),
          statusCode: 400,
        });
      }

      if (user.password === null) {
        return errorResponse({
          res,
          error: new Error("You have to login with social media account."),
          statusCode: 404,
        });
      }

      if (!(await bcrypt.compare(password, user.password))) {
        return errorResponse({
          res,
          error: new Error("Invalid credentials."),
          statusCode: 400,
        });
      }

      if (!user.isActive || !user.isVerified) {
        return errorResponse({
          res,
          statusCode: 403,
          error: new Error(
            "User is not verified. Please complete the verification process.",
          ),
        });
      }

      const token = jwt.sign({ userId: user._id }, config.jwt.secret_key, {
        expiresIn: "50d",
      });

      const {
        isActive,
        otp,
        isVerified,
        joiningDate,
        otpExpiration,
        role,
        address,
        authProvider,
        password: userPassword,
        ...userWithoutPassword
      } = user.toObject();
      const response = { user: userWithoutPassword, token };

      return successResponse({
        res,
        statusCode: 200,
        data: response,
        message:
          "Authentication Successful: You have been granted access to your account.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "auth.login",
      });
    }
  };

  /**
   * google login
   */
  static googleLogin = async (req, res) => {
    try {
      const { token } = req.body;

      const client = new OAuth2Client({
        clientId: config.google.client_id,
        clientSecret: config.google.client_secret,
        redirectUri: config.google.redirect_url,
      });

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: config.google.client_id,
      });

      const { email, sub, picture } = ticket.getPayload();
      if (!email || !sub) {
        return errorResponse({
          res,
          statusCode: 401,
          error: new Error("Invalid token or payload."),
          funName: "auth.googleLogin",
        });
      }

      let user = await AuthModel.findOne({ email }).select(
        "-password -role -isVerified -isActive -otp -otpExpiration -joiningDate",
      );

      let role, customerId;
      if (!user) {
        if (email === config.admin.email) {
          role = userRoleEnum.ADMIN;
        }
        const username = email.split("@")[0].replace(".", " ");
        if (role !== userRoleEnum.ADMIN) {
          customerId = uuidv4();
        }
        const newUser = {
          email,
          url: picture,
          username,
          customerId,
          role,
          isActive: true,
          isVerified: true,
          authProvider: authProviderEnum.GOOGLE,
        };
        user = await AuthModel.create(newUser);
        await AuthModel.updateOne(
          { _id: newUser._id },
          { $set: { otp: null, otpExpiration: null, password: null, role } },
        );
      }

      user.authProvider = authProviderEnum.GOOGLE;
      await user.save();
      await AuthModel.updateOne(
        { _id: user._id },
        { $set: { otp: null, otpExpiration: null, password: null } },
      );

      const generatedToken = await generateToken({ userId: user._id });
      const result = { token: generatedToken, user };

      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "User logged in successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "auth.googleLogin",
      });
    }
  };

  /**
   * verify token
   */
  static verifyToken = async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return errorResponse({
          res,
          error: Error("Token is required."),
          statusCode: 400,
        });
      }
      const payload = jwt.verify(token, config.jwt.secret_key);
      const userId = await payload.userId;
      if (!userId) {
        return errorResponse({
          res,
          error: Error("Invalid token."),
          statusCode: 401,
        });
      }

      const result = await AuthModel.findById(userId).select(
        "username email phone authProvider url customerId role empId",
      );
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Token verified successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "auth.verifyToken",
      });
    }
  };

  /**
   * reset password
   */
  static resetPassword = async (req, res) => {
    try {
      const { userId } = jwt.verify(req.query.token, config.jwt.secret_key);
      if (!userId) {
        return errorResponse({
          res,
          error: { message: "Token is required." },
          statusCode: 400,
        });
      }
      const hashPassword = await bcrypt.hash(req.body.newPassword, 10);
      const result = await services.resetPasswordService(userId, hashPassword);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "Your password is reset.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "auth.resetPassword",
      });
    }
  };

  /**
   * forgot password
   */
  static forgotPassword = async (req, res) => {
    try {
      const user = await AuthModel.findOne({ email: req.body.email });
      if (!user) {
        const errorObj = {
          details: [{ path: "email", message: "Email does not exist." }],
        };
        return validateResponse({ res, error: errorObj });
      }

      const token = await jwt.sign(
        { userId: user._id },
        config.jwt.secret_key,
        {
          expiresIn: "1d",
        },
      );

      const link = `${config.client_url}/reset-password?token=${token}`;
      await sendMail({
        to: req.body.email,
        subject: "Password Reset Request",
        dynamicData: { username: user.username, email: user.email, link: link },
        filename: "forgotpassword.html",
      });

      return successResponse({
        res,
        statusCode: 200,
        message: "Reset password mail successfully send to your email address.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "auth.forgotPassword" });
    }
  };

  /**
   * get all users
   */
  static getAllUsers = async (req, res) => {
    const { id } = req.params;
    const { userName, authProvider, role, search } = req.query;
    try {
      let filter = {};
      if (id) filter._id = new mongoose.Types.ObjectId(id);
      if (userName) filter.userName = { $regex: userName, $options: "i" };
      if (role) filter.role = { $regex: new RegExp(`^${role}$`, "i") };
      if (authProvider)
        filter.authProvider = { $regex: authProvider, $options: "i" };

      if (search) {
        filter.$or = [
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ];
      }

      const pagination = paginationFun(req.query);
      let count, paginationData;
      count = await AuthModel.countDocuments(filter);
      paginationData = paginationDetails({
        limit: pagination.limit,
        page: req.query.page,
        totalItems: count,
      });

      const result = await services.getAllUsers(filter, pagination);
      return successResponse({
        res,
        statusCode: 200,
        pagination: paginationData,
        data: result,
        message: "User list fetched successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };

  /**
   * Get customer
   */
  static getCustomer = async (req, res) => {
    try {
      const filter = {};
      const { search } = req.query;

      filter.role = userRoleEnum.CUSTOMER;
      if (search) {
        filter.$or = [
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
        ];
      }

      const pagination = paginationFun(req.query);
      let count, paginationData;
      count = await AuthModel.countDocuments(filter);

      const result = await AuthModel.find(filter).select(
        "joiningDate customerId username customerId phone isActive url email",
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
        message: "User list retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "auth.getCustomer" });
    }
  };

  /**
   * Get customer details
   */
  static customerDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const { customerId } = req.query;

      let filter = {};
      if (id) filter._id = new mongoose.Types.ObjectId(id);
      if (customerId)
        filter.customerId = { $regex: new RegExp(`^${customerId}$`, "i") };

      const user = await AuthModel.findOne({ customerId: customerId }).select(
        "username email phone customerId url phone joiningDate createdAt",
      );
      const orders = await OrderModel.find({ user: user._id })
        .select(
          "user shippingAddress billingAddress orderId items totalAmount status paymentMethod createdAt updatedAt",
        )
        .sort({ createdAt: -1 });

      return successResponse({
        res,
        statusCode: 200,
        data: { user, orders },
        message: "User details retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({ res, error, funName: "auth.customerDetails" });
    }
  };

  /**
   * Get staff
   */
  static getStaff = async (req, res) => {
    try {
      let filter = {};
      const { search } = req.query;
      if (search) {
        filter.$or = [
          { email: { $regex: search, $options: "i" } },
          { username: { $regex: search, $options: "i" } },
          { role: { $regex: new RegExp(`^${search}$`, "i") } },
        ];
      }

      const pagination = paginationFun(req.query);
      let count, paginationData;

      let result;
      if (req.user.role === userRoleEnum.ADMIN) {
        filter.role = { $ne: userRoleEnum.CUSTOMER };
        count = await AuthModel.countDocuments(filter);
        result = await AuthModel.find(filter)
          .select(
            "empId url username email phone role isActive isVerified facebook linkedin instagram twitter",
          )
          .skip(pagination.skip)
          .limit(pagination.limit)
          .sort({ createdAt: -1 });
      } else {
        filter.role = { $nin: [userRoleEnum.ADMIN, userRoleEnum.CUSTOMER] };
        count = await AuthModel.countDocuments(filter);
        result = await AuthModel.find(filter)
          .select(
            "empId url username email phone role isActive isVerified facebook linkedin instagram twitter",
          )
          .skip(pagination.skip)
          .limit(pagination.limit)
          .sort({ createdAt: -1 });
      }

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
        message: "User list retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "auth.getStaff",
      });
    }
  };

  /**
   * Get staff details
   */
  static staffDetails = async (req, res) => {
    try {
      const { id } = req.params;
      const { staff } = req.query;

      let filter = {};
      if (id) filter._id = new mongoose.Types.ObjectId(id);
      if (staff) filter.empId = parseFloat(staff);
      const result = await AuthModel.find(filter).select("-password");
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "User details retrieved successfully.",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "auth.staffDetails",
      });
    }
  };

  /**
   * update user
   */
  static updateUserController = async (req, res) => {
    try {
      const { id } = req.params;
      const findDoc = await AuthModel.findById(id);
      if (!findDoc) {
        return errorResponse({
          res,
          error: Error("User not found."),
          statusCode: 404,
        });
      }
      if (req.body.oldPassword) {
        const comparePassword = await bcrypt.compare(
          req.body.oldPassword,
          req.user.password || findDoc.password,
        );
        if (!comparePassword) {
          return validateResponse({
            res,
            error: {
              details: [
                {
                  path: "oldPassword",
                  message: "Old password does not match the current password.",
                },
              ],
            },
          });
        }
        if (req.body.newPassword !== req.body.confirmPassword) {
          console.log(req.body.newPassword, "newPassword");
          console.log(req.body.confirmPassword, "confirmPassword");
          return validateResponse({
            res,
            error: {
              details: [
                {
                  path: "confirmPassword",
                  message: "New password and confirm password do not match.",
                },
              ],
            },
          });
        }
        const hashPassword = await bcrypt.hash(req.body.newPassword, 10);
        await AuthModel.findByIdAndUpdate(
          req.user._id,
          { $set: { password: hashPassword } },
          { new: true },
        );
      }
      let newUrl = await updateFile(req, findDoc, folderName);
      const updateUser = await AuthModel.findByIdAndUpdate(
        id,
        { $set: req.body, url: newUrl },
        { new: true },
      ).select("-password -role -isVerified -isActive");
      return successResponse({
        res,
        statusCode: 200,
        data: updateUser,
        message: "User information and password changed successfully!",
      });
    } catch (error) {
      return errorResponse({
        res,
        error,
        funName: "updateUserAndChangePassword",
      });
    }
  };

  /**
   * update role
   */
  static updateRole = async (req, res) => {
    try {
      const { id } = req.params;
      const { role, isActive } = req.body;

      const find = await AuthModel.findById(id);
      if (!find) {
        return errorResponse({
          res,
          error: Error("User not found."),
          statusCode: 404,
        });
      }

      const doc = { role, isActive };
      const result = await services.updateRole(id, doc);
      return successResponse({
        res,
        statusCode: 200,
        data: result,
        message: "User role is updated.",
      });
    } catch (error) {
      return errorResponse({ res, error });
    }
  };
}

export default controller;
