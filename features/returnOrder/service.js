import ReturnOrderModel from "./model.js";

class Services {
    /**
     * create
     */
    static create = async (doc) => {
        return ReturnOrderModel.create(doc);
    };

    /**
     * get
     */
    static get = async (filter,pagination) => {
        return ReturnOrderModel.find(filter)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort({createdAt: -1});
    };

    /**
     * update
     */
    static patch = async (id,doc) => {
        return ReturnOrderModel.findByIdAndUpdate(id,{$set: doc},{new: true});
    };
}

export default Services;
