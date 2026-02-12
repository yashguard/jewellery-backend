import AuthModel from "../authentication/model.js";

class services {
    /**
     * register
     */
    static registerService = async (reqBody) => {
        return AuthModel.create(reqBody);
    };

    /**
     * get customer
     */
    static getCustomer = async (filter) => {
        return AuthModel.find(filter)
            .select('-password -isActive -isVerified -role -authProvider');
    };

    /**
     * get all users by admin
     */
    static getAllUsers = async (filter,pagination) => {
        return AuthModel.find(filter)
            .select('-password -otp -otpExpiration')
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort({createdAt: -1});
    };

    /**
     * update user
     */
    static updateUserService = async (id,req,newUrl) => {
        return await AuthModel.findByIdAndUpdate(
            id,
            {$set: req.body,url: newUrl},
            {new: true}
        ).select("-password -role -address -isVerified -isActive");
    };

    /**
     * reset-password
     */
    static resetPasswordService = async (userId,hashPassword) => {
        return await AuthModel.findByIdAndUpdate(userId,{
            $set: {password: hashPassword},
        },{new: true}).select("-password -role -isActive -isVerified -address");
    };

    /**
     * update role
     */
    static updateRole = async (id,doc) => {
        return AuthModel.findByIdAndUpdate(
            id,
            {$set: doc},
            {new: true}
        ).select("-password");
    };
}

export default services;
