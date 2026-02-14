import HomeModel from "./model.js";

class Services {
    /**
     * create
     */
    static create = async (doc) => {
        return HomeModel.create(doc);
    };

    /**
     * get
     */
    static get = async () => {
        return HomeModel.find();
    };

    /**
     * update
     */
    static update = async (id,doc) => {
        return await HomeModel.findByIdAndUpdate(
            id,
            {$set: doc},
            {new: true}
        );
    };

    /**
     * delete
     */
    static delete = async (id) => {
        return await HomeModel.findByIdAndDelete(id);
    };
}
export default Services;
