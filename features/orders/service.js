import OrderModel from "./model.js";

class Service {
    /**
     * create
     */
    static create = async (id,doc) => {
        return OrderModel.findByIdAndUpdate(id,{$set: doc},{new: true})
            .populate({path: "couponCode",select: "code description discountValue discountType savedAmount"})
            .populate({path: "items.product",select: "name files title purity metalColor"})
            .populate({path: "items.variant",select: "name files title purity metalColor"});
    };

    /**
     * get
     */
    static get = async (filter) => {
        return await OrderModel.find(filter)
            .populate({path: "couponCode",select: "code description discountValue discountType savedAmount"})
            .populate({path: "items.product",select: "name files title purity metalColor"})
            .populate({path: "items.variant",select: "name files title purity metalColor"});
    };

    /**
     * update status
     */
    static updateStatus = async (id,doc) => {
        return OrderModel.findByIdAndUpdate(id,{$set: doc},{new: true});
    };

    /**
     * existing order
     */
    static existingOrder = async (id) => {
        return OrderModel.findById(id);
    };
}

export default Service;
