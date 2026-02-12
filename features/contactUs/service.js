import ContactUsModel from "./model.js";

class Services {
    /**
     * create
     */
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
     * delete
     */
    static deleteContact = async (id) => {
        return ContactUsModel.findByIdAndDelete(id);
    };
}

export default Services;
