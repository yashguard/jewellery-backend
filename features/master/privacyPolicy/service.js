import PrivacyPolicyModel from "./model.js";

class Service {
    /**
     * create
     */
    static create = async (doc) => {
        return PrivacyPolicyModel.create(doc);
    };

    /**
     * get
     */
    static get = async (filter) => {
        return PrivacyPolicyModel.find(filter);
    };

    /**
     * update
     */
    static update = async (id,updateFields) => {
        return PrivacyPolicyModel.findByIdAndUpdate(
            id,
            {$set: updateFields},
            {new: true}
        );
    };

    /**
     * findById
     */
    static findById = async (id) => {
        return PrivacyPolicyModel.findById(id);
    };

    /**
     * delete
     */
    static delete = async (id) => {
        return PrivacyPolicyModel.findByIdAndDelete(id);
    };
}

export default Service;
