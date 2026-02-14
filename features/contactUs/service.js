import ContactUsModel from "./model.js";

class Services {
    /**
     * create
     */
    static create = async (doc) => {
        return ContactUsModel.create(doc);
    };

    /**
     * get
     */
    static get = async (pagination) => {
        return ContactUsModel.find()
            .skip(pagination.skip)
            .limit(pagination.limit)
            .skip(pagination.skip)
            .sort({createdAt: -1});
    };

    /**
     * update
     */
    static update = async (id,status) => {
        return ContactUsModel.findByIdAndUpdate(id,{$set: {status}},{new: true});
    };

    /**
     * find contact
     */
    static existingContact = async (id) => {
        return ContactUsModel.findById(id);
    };

    /**
     * delete
     */
    static deleteContact = async (id) => {
        return ContactUsModel.findByIdAndDelete(id);
    };
}

export default Services;
