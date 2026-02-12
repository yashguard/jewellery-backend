import CategoryModel from "../category/model.js";

class services {
    /**
     * create
     */
    static create = async (doc) => {
        return await CategoryModel.create(doc);
    };

    /**
     * get
     */
    static get = async (filter) => {
        return await CategoryModel.aggregate([
            {
                $match: filter
            },
            {
                $sort: {createdAt: -1}
            },
            {
                $lookup: {
                    from: "subcategories",
                    localField: "subCategory",
                    foreignField: "_id",
                    as: "subCategory"
                }
            },
            {
                $lookup: {
                    from: "filters",
                    localField: "filters",
                    foreignField: "_id",
                    as: "filters"
                }
            }
        ]);
    };

    /**
     * update
     */
    static update = async (id,updateFields) => {
        return await CategoryModel.findByIdAndUpdate(
            id,
            {$set: updateFields},
            {new: true}
        );
    };
}
export default services;
