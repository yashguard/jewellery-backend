import ProductModel from "./model.js";

class Services {
    /**
     * create
     */
    static create = async (doc) => {
        return ProductModel.create(doc);
    };

    /**
     * get
     */
    static getProduct = async (matchStage,sortStage,pagination) => {
        return ProductModel.find(matchStage)
            .sort(sortStage)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .populate({
                path: 'subCategory',
                select: '_id title type description url slug'
            })
            .populate({
                path: 'category',
                select: '_id type title description url slug'
            })
            .select('files name description discount grandTotal title slug discountValue label tag totalCost')
            .exec();
    };

    /**
     * get by admin
     */
    static getByAdmin = async (matchStage,sortStage,pagination) => {
        return ProductModel.find(matchStage)
            .sort(sortStage)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .populate({
                path: 'subCategory',
                select: '_id title slug type description url slug'
            })
            .populate({
                path: 'category',
                select: '_id type slug description url slug'
            })
            .select('sku title description isDraft availability quantity hasVariant slug sales totalCost grandTotal')
            .exec();
    };

    /**
     * get by admin
     */
    static getProductDetails = async (matchStage,pagination) => {
        return ProductModel.find(matchStage)
            .skip(pagination.skip)
            .limit(pagination.limit)
            .sort({createdAt: -1})
            .exec();
    };

    /**
     * update
     */
    static update = async (id,doc) => {
        return await ProductModel.findByIdAndUpdate(
            id,
            {$set: doc},
            {new: true}
        );
    };

}
export default Services;
