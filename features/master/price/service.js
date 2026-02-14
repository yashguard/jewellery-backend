import ProductModel from "../product/model.js";
import ProductVariantModel from "../productVariants/model.js";
import PriceModel from "./model.js";

class Service {
    /**
     * create
     */
    static create = async (doc) => {
        return PriceModel.create(doc);
    };

    /**
     * Get
     */
    static get = async (filter) => {
        return PriceModel.find(filter);
    };

    /**
     * Find product
     */
    static findProduct = async () => {
        return ProductModel.find();
    };

    /**
     * Find product variants
     */
    static findProductVariants = async () => {
        return ProductVariantModel.find();
    };

    /**
     * Find price
     */
    static findPrice = async (id) => {
        return PriceModel.findById(id);
    };

    /**
    * Save product
    */
    static saveProduct = async (product) => {
        return await ProductModel.updateOne(
            {_id: product._id},
            {$set: product},
            {new: true}
        );
    };

    /**
     * save variant
     */
    static saveVariant = async (variant) => {
        return await ProductVariantModel.updateOne(
            {_id: variant._id},
            {$set: variant},
            {new: true}
        );
    };

    /**
     * Update Price
     */
    static updatePrice = async (id,doc) => {
        return await PriceModel.findByIdAndUpdate(id,{$set: doc},{new: true});
    };

    /**
     * Find all products
     */
    static findAllProducts = async () => {
        return await ProductModel.find();
    };

}

export default Service;
