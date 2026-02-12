import ProductVariantModel from "./model.js";

class Service {
    /**
     * create
     */
    static create = async (doc) => {
        return ProductVariantModel.create(doc);
    };

    /**
     * get by admin
     */
    static getByAdmin = async (matchStage) => {
        return ProductVariantModel.aggregate([
            {
                $match: matchStage
            },
            {
                $sort: {createdAt: -1}
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    "product._id": 1,
                    "product.title": 1,
                    "product.tag": 1,
                    "product.hasVariant": 1,
                    "product.metalColor": 1,
                    "product.purity": 1,
                    "product.size": 1,
                    "product.range": 1,
                    "childSku": 1,
                    "shortDescription": 1,
                    "isDraft": 1,
                    "material": 1,
                    "metalColor": 1,
                    "purity": 1,
                    "status": 1,
                    "diamondQuality": 1,
                    "weight": 1,
                    "length": 1,
                    "slug": 1,
                    "title": 1,
                    "width": 1,
                    "height": 1,
                    "size": 1,
                    "range": 1,
                    "price": 1,
                    "grandTotal": 1,
                    "subTotal": 1,
                    "taxValue": 1,
                    "taxType": 1,
                    "cost": 1,
                    "attributes": 1,
                    "totalPrice": 1,
                    "files": 1,
                    "discountValue": 1,
                    "savedAmount": 1,
                    "discountType": 1,
                    "discountDescription": 1,
                    "quantity": 1,
                    "rating": 1,
                    "sales": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                }
            }
        ]);
    };

    /**
     * get variant
     */
    static getVariant = async (filter) => {
        return ProductVariantModel.aggregate([
            {
                $match: filter
            },
            {
                $sort: {createdAt: -1}
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    "product._id": 1,
                    "product.title": 1,
                    "product.tag": 1,
                    "product.hasVariant": 1,
                    "product.metalColor": 1,
                    "product.purity": 1,
                    "product.size": 1,
                    "product.range": 1,
                    "childSku": 1,
                    "isDraft": 1,
                    "slug": 1,
                    "metalColor": 1,
                    "purity": 1,
                    "status": 1,
                    "size": 1,
                    "range": 1,
                    "diamondQuality": 1,
                    "attributes": 1,
                    "quantity": 1,
                    "rating": 1,
                    "sales": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                }
            }
        ]);
    };

    /**
     * get status and price
     */
    static getStatusAndPrice = async (matchStage) => {
        return ProductVariantModel.find(matchStage).select("status grandTotal product");
    };

    /**
     * get by customer
     */
    static getDetails = async (matchStage) => {
        return ProductVariantModel.aggregate([
            {
                $match: matchStage
            },
            {
                $sort: {createdAt: -1}
            },
            {
                $lookup: {
                    from: "products",
                    localField: "product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    "product._id": 1,
                    "product.title": 1,
                    "product.tag": 1,
                    "product.hasVariant": 1,
                    "product.metalColor": 1,
                    "product.purity": 1,
                    "product.size": 1,
                    "product.range": 1,
                    "childSku": 1,
                    "shortDescription": 1,
                    "isDraft": 1,
                    "material": 1,
                    "metalColor": 1,
                    "purity": 1,
                    "status": 1,
                    "diamondQuality": 1,
                    "weight": 1,
                    "length": 1,
                    "slug": 1,
                    "title": 1,
                    "width": 1,
                    "height": 1,
                    "size": 1,
                    "range": 1,
                    "price": 1,
                    "grandTotal": 1,
                    "subTotal": 1,
                    "taxValue": 1,
                    "taxType": 1,
                    "cost": 1,
                    "attributes": 1,
                    "totalPrice": 1,
                    "files": 1,
                    "quantity": 1,
                    "rating": 1,
                    "sales": 1,
                    "discountValue": 1,
                    "savedAmount": 1,
                    "discountType": 1,
                    "discountDescription": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                }
            }
        ]);
    };

    /**
     * update
     */
    static update = async (id,doc) => {
        return ProductVariantModel.findByIdAndUpdate(id,{$set: doc},{new: true});
    };
}
export default Service;
