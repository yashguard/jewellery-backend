import {errorResponse} from "../helper/apiResponse.js";

/**
 * Check permissions for a given user and return the permissions
 */
export const checkPermission = (allowedRoles) => {
    return (req,res,next) => {
        const userRole = req.user.role;
        if (allowedRoles.includes(userRole)) {
            next();
        } else {
            return errorResponse({
                res,
                error: Error("You are not authorized to perform this action."),
                statusCode: 401,
            });
        }
    };
};
