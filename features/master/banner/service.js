import BannerModel from "./model.js";

class Services {
    /**
     * create
     */
    static create = async (doc) => {
        return BannerModel.create(doc);
    };

    /**
     * get
     */
    static get = async () => {
        return BannerModel.find();
    };

    /**
     * update
     */
    static update = async (id,doc) => {
        return await BannerModel.findByIdAndUpdate(
            id,
            {$set: doc},
            {new: true}
        );
    };

    /**
     * delete banner
     */
    static deleteBanner = async (id) => {
        return await BannerModel.findByIdAndDelete(id);
    };
}
export default Services;
