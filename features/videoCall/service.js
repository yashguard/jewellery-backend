import VideoCallModel from "./model.js";

class Services {
    /**
     * create
     */
    static create = async (doc) => {
        return VideoCallModel.create(doc);
    };

    /**
     * get
     */
    static get = async (filter,pagination) => {
        return VideoCallModel.find(filter)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort({createdAt: -1});
    };

    /**
     * update
     */
    static patch = async (id,doc) => {
        return VideoCallModel.findByIdAndUpdate(id,{$set: doc},{new: true});
    };
}

export default Services;
