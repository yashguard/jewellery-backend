import jwt from "jsonwebtoken";
import {config} from "../config/config.js";
import AuthModel from "../features/authentication/model.js";
import {validateResponse} from "../helper/apiResponse.js";

/**
 * Verify Token
 */
export const verifyToken = async (req,res,next) => {
  try {
    const token = req.headers.authorization;
    if (!token || !token.startsWith("Bearer ")) {
      return validateResponse({res,error: {message: "Authentication and bearer token is required."},statusCode: 401});
    }

    const tokenParts = token.split(" ");
    if (tokenParts.length !== 2) {
      return validateResponse({res,error: {message: "Invalid token format."},statusCode: 401});
    }

    const tokenValue = tokenParts[ 1 ];
    try {
      const verify = jwt.verify(tokenValue,config.jwt.secret_key);
      if (!verify || !verify.userId) {
        return validateResponse({res,error: {message: "Token expired or invalid."},statusCode: 401});
      }

      const user = await AuthModel.findById(verify.userId);
      if (!user) {
        return validateResponse({res,error: {message: "User not found."},statusCode: 401});
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return validateResponse({res,error: {message: "Token expired or invalid."},statusCode: 401});
    }
  } catch (error) {
    return validateResponse({res,error: {message: "Internal server error."},statusCode: 500});
  }
};
