import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import Service from "./service.js";

class controller {
    /**
     * Create
     */
    static create = async (req,res) => {
        try {
            const {taxValue} = req.body;
            const result = await Service.create(taxValue);
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Tax rate is created successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "taxRate.create"
            });
        }
    };

    /**
     * Update
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {taxValue} = req.body;

            const existingTaxRate = await Service.existingTaxRate(id);
            if (!existingTaxRate) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Tax rate not found.")
                });
            }

            const result = await Service.update(id,taxValue);

            // Update tax value for all products and their variants
            const products = await Service.findAllProducts();
            for (const product of products) {
                product.taxValue = taxValue;
                product.taxAmount = (product.subTotal * parseFloat(taxValue)) / 100;
                product.grandTotal = product.subTotal + product.taxAmount;
                product.grandTotal = Math.floor(product.grandTotal);
                await product.save();
            }

            const variants = await Service.findAllVariants();
            for (const variant of variants) {
                variant.taxValue = taxValue;
                variant.taxAmount = (variant.subTotal * parseFloat(taxValue)) / 100;
                variant.grandTotal = variant.subTotal + variant.taxAmount;
                variant.grandTotal = Math.floor(variant.grandTotal);
                await variant.save();
            }

            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Tax rate is updated successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "taxRate.update"
            });
        }
    };

    /**
     * Get
     */
    static get = async (req,res) => {
        try {
            const findTax = await Service.findTax();
            return successResponse({
                res,
                statusCode: 200,
                data: findTax,
                message: "All tax rates are fetched successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "taxRate.get"
            });
        }
    };
}

export default controller;
