import mongoose from "mongoose";
import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import Service from "./service.js";
import {discountTypeEnum} from "../../../config/enum.js";
import PriceModel from "./model.js";
import ProductModel from "../product/model.js";
import ProductVariantModel from "../productVariants/model.js";

class controller {
    /**
     * Create Price
     */
    static create = async (req,res) => {
        try {
            const {metal,ratePerGram,discountValue,discountType,discountDescription,startAt,endAt} = req.body;
            const doc = {metal,ratePerGram,discountValue,discountType,discountDescription,startAt,endAt};
            const result = await Service.create(doc);
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Price is created successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "price.create"
            });
        }
    };

    /**
     * Get price
     */
    static get = async (req,res) => {
        try {
            const {id} = req.params;
            const filter = {};

            if (id) filter._id = new mongoose.Types.ObjectId(id);
            const result = await Service.get(filter);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Price list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "price.get"
            });
        }
    };

    /**
     * Update price
     */
    static update = async (req,res) => {
        try {
            const {metal,ratePerGram,discountValue,discountType,discountDescription,startAt,endAt} = req.body;
            const {id} = req.params;

            const existingPrice = await PriceModel.findById(id);
            if (!existingPrice) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: new Error("Document not found."),
                });
            }

            const doc = {metal,ratePerGram,discountValue,discountType,discountDescription,startAt,endAt};
            const result = await Service.updatePrice(id,doc);

            const existingProducts = await ProductModel.find();
            if (!existingProducts) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: new Error("Products not found."),
                });
            }

            for (const product of existingProducts) {
                let subTotal = 0;
                let grandTotal = 0;
                let updated = false;
                for (const cost of product.cost) {
                    if (cost.metal === metal || cost.metal === existingPrice.metal) {
                        if (ratePerGram) {
                            cost.ratePerGram = ratePerGram;
                            cost.totalCost = cost.ratePerGram * cost.costWeight;
                        } else {
                            cost.totalCost = cost.ratePerGram * cost.costWeight;
                        }

                        if (discountValue) {
                            cost.costDiscount = discountValue;
                            if (cost.costDiscountType === discountTypeEnum.PERCENTAGE) {
                                cost.saveCost = (cost.totalCost * discountValue) / 100;
                            }
                            if (cost.costDiscountType === discountTypeEnum.AMOUNT) {
                                cost.saveCost = discountValue;
                            }
                        }

                        if (discountType) {
                            cost.costDiscountType = discountType;
                            if (discountType === discountTypeEnum.PERCENTAGE) {
                                cost.saveCost = (cost.totalCost * discountValue) / 100;
                            }
                            if (discountType === discountTypeEnum.AMOUNT) {
                                cost.saveCost = discountValue;
                            }
                        }

                        if (discountValue && discountType) {
                            cost.costDiscount = discountValue;
                            cost.costDiscountType = discountType;

                            if (discountType === discountTypeEnum.PERCENTAGE) {
                                cost.saveCost = (cost.totalCost * discountValue) / 100;
                            }
                            if (discountType === discountTypeEnum.AMOUNT) {
                                cost.saveCost = discountValue;
                            }
                        }

                        cost.totalCost -= cost.saveCost;
                        cost.totalCost = Math.ceil(cost.totalCost);
                        updated = true;
                    }
                }

                if (updated) {
                    subTotal = product.cost.reduce((acc,item) => acc + item.totalCost,0) + product.price || 0;
                    product.totalCost = subTotal;
                    grandTotal = subTotal;
                    if (product.discountType === discountTypeEnum.PERCENTAGE) {
                        product.savedAmount = (subTotal * product.discountValue) / 100;
                        subTotal -= product.savedAmount;
                    }
                    if (product.discountType === discountTypeEnum.AMOUNT) {
                        subTotal -= product.discountValue;
                    }

                    if (product.taxValue) {
                        const taxAmount = (subTotal * parseFloat(product.taxValue)) / 100;
                        grandTotal = subTotal + taxAmount;
                    }

                    product.subTotal = Math.floor(subTotal);
                    product.grandTotal = Math.floor(grandTotal);
                    await Service.saveProduct(product);
                }
            }

            const existingVariants = await ProductVariantModel.find();

            for (const variant of existingVariants) {
                let subTotal = 0;
                let grandTotal = 0;
                let updated = false;
                for (const cost of variant.cost) {
                    if (cost.metal === metal || cost.metal === existingPrice.metal) {
                        if (ratePerGram) {
                            cost.ratePerGram = ratePerGram;
                            cost.totalCost = cost.ratePerGram * cost.costWeight;
                        } else {
                            cost.totalCost = cost.ratePerGram * cost.costWeight;
                        }

                        if (discountValue) {
                            cost.costDiscount = discountValue;
                            if (cost.costDiscountType === discountTypeEnum.PERCENTAGE) {
                                cost.saveCost = (cost.totalCost * discountValue) / 100;
                            }
                            if (cost.costDiscountType === discountTypeEnum.AMOUNT) {
                                cost.saveCost = discountValue;
                            }
                        }

                        if (discountType) {
                            cost.costDiscountType = discountType;
                            if (discountType === discountTypeEnum.PERCENTAGE) {
                                cost.saveCost = (cost.totalCost * discountValue) / 100;
                            }
                            if (discountType === discountTypeEnum.AMOUNT) {
                                cost.saveCost = discountValue;
                            }
                        }

                        if (discountValue && discountType) {
                            cost.costDiscount = discountValue;
                            cost.costDiscountType = discountType;

                            if (discountType === discountTypeEnum.PERCENTAGE) {
                                cost.saveCost = (cost.totalCost * discountValue) / 100;
                            }
                            if (discountType === discountTypeEnum.AMOUNT) {
                                cost.saveCost = discountValue;
                            }
                        }

                        cost.totalCost -= cost.saveCost;
                        cost.totalCost = Math.ceil(cost.totalCost);
                        updated = true;
                    }
                }

                if (updated) {
                    subTotal = variant.cost.reduce((acc,item) => acc + item.totalCost,0) + variant.price || 0;
                    variant.totalCost = subTotal;
                    grandTotal = subTotal;
                    if (variant.discountType === discountTypeEnum.PERCENTAGE) {
                        variant.savedAmount = (subTotal * variant.discountValue) / 100;
                        subTotal -= variant.savedAmount;
                    }
                    if (variant.discountType === discountTypeEnum.AMOUNT) {
                        subTotal -= variant.discountValue;
                    }

                    if (variant.taxValue) {
                        const taxAmount = (subTotal * parseFloat(variant.taxValue)) / 100;
                        grandTotal = subTotal + taxAmount;
                    }

                    variant.subTotal = Math.floor(subTotal);
                    variant.grandTotal = Math.floor(grandTotal);
                    await Service.saveProduct(variant);
                }
            }

            return successResponse({
                res,
                statusCode: 200,
                data: existingVariants,
                message: "Price and product are updated successfully.",
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "price.update",
            });
        }
    };
}

export default controller;
