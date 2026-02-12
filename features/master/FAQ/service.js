import FaqModel from "./model.js";

class Services {
    static create = async (doc) => {
        return FaqModel.create(doc);
    };

    static get = async (filter) => {
        return FaqModel.find(filter).sort({createdAt: -1});
    };

    static update = async (id,doc) => {
        return FaqModel.findByIdAndUpdate(id,{$set: doc},{new: true});
    };

    static deleteFaq = async (id) => {
        return FaqModel.findByIdAndDelete(id);
    };
}
export default Services;
