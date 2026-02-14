import ProductModel from "../product/model.js";
import ProductVariantModel from "../productVariants/model.js";
import TaxModel from "./model.js";

class Service {
    /**
     * Create
     */
    static create = async (taxValue) => {
        return TaxModel.create({taxValue: taxValue});
    };

    /**
     * Existing tax
     */
    static existingTaxRate = async (id) => {
        return TaxModel.findById(id);
    };

    /**
     * Update
     */
    static update = async (id,taxValue) => {
        return TaxModel.findByIdAndUpdate(id,{$set: {taxValue}},{new: true});
    };

    /**
     * Find all tax
     */
    static findTax = async () => {
        return TaxModel.find({});
    };

    /**
     * Find all products
     */
    static findAllProducts = async () => {
        return ProductModel.find();
    };

    /**
     * Find all variants
     */
    static findAllVariants = async () => {
        return ProductVariantModel.find();
    };
}

export default Service;
