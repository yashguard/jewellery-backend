import AboutUsModel from "./model.js";

class Service {
    /**
     * create team
     */
    static createTeam = async (doc) => {
        return AboutUsModel.create(doc);
    };

    /**
     * create percentage
     */
    static createPercentage = async (doc) => {
        return AboutUsModel.create(doc);
    };

    /**
     * get
     */
    static get = async (filter) => {
        return AboutUsModel.find(filter)
            .sort({createdAt: -1});
    };

    /**
     * find doc
     */
    static findDoc = async (id) => {
        return AboutUsModel.findById(id);
    };

    /**
     * update
     */
    static update = async (id,doc) => {
        return AboutUsModel.findByIdAndUpdate(id,{$set: doc},{new: true});
    };

    /**
     * delete
     */
    static delete = async (id) => {
        return AboutUsModel.findByIdAndDelete(id);
    };
}

export default Service;
