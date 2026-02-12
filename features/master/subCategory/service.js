import SubcategoryModel from "./model.js";

class service {
    /**
     * create
     */
    static create = async (doc) => {
        const result = await SubcategoryModel.create(doc);
        return SubcategoryModel.findById(result._id)
            .populate({
                path: "category",
                select: "-filters -subCategory"
            })
            .exec();
    };

    /**
     * get
     */
    static get = async (filter,pagination) => {
        return SubcategoryModel.find(filter)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort({createdAt: -1})
            .populate({
                path: 'category',
                select: '-filters -subCategory'
            })
            .exec();
    };


    /**
     * update
     */
    static update = async (id,updateFields) => {
        return SubcategoryModel.findByIdAndUpdate(id,{$set: updateFields},{new: true})
            .populate({
                path: 'category',
                select: '-filters -subCategory'
            });
    };

}
export default service;
