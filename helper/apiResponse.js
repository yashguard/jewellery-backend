import mongoose from "mongoose";

/**success response */
export const successResponse = ({
  res,
  statusCode,
  data,
  message,
  success = true,
  ...options
}) => {
  return res.status(statusCode).json({message,success,...options,data});
};

/**error response */
export const errorResponse = async ({
  funName,
  res,
  error,
  success = false,
  statusCode = 500,
  message = "Internal server error",
}) => {
  console.log(`[ERROR] ${ funName } : ${ error.message }`);
  message = error.message;
  if (error instanceof mongoose.Error.CastError) {
    message = "Invalid ID provided.";
  } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
    message = "Document not found.";
  } else if (error instanceof mongoose.Error.ValidationError) {
    message = "Validation failed.";
    statusCode = 400;
  }
  if (error.name === "MongoServerError" && error.code === 11000) {
    message = "Document already exists.";
    statusCode = 409;
  }
  if (error.error) {
    if (error.error.step === "payment_initiation" && error.error.code === "BAD_REQUEST_ERROR" && error.error.field === "amount") {
      message = "Amount exceeds maximum amount allowed.",
        statusCode = 400;
    } else if (error.error.step === "payment_initiation" && error.error.code === "BAD_REQUEST_ERROR") {
      message = "The id provided does not exist.",
        statusCode = 400;
    }
  }
  return res.status(statusCode).json({success,message});
};

/**validate response */
export const validateResponse = ({res,error,statusCode = 400}) => {
  let arrOjb = {message: "error",success: false};

  if (error.details) {
    error.details.map((item,key) => {
      const {path,message} = item;
      arrOjb = {...arrOjb,[ path[ 1 ] ]: message.replace(/['"]/g,"")};
    });
  } else {
    arrOjb.message = error.message.replace(/['"]/g,"");
  }

  return res.status(statusCode).json(arrOjb);
};
