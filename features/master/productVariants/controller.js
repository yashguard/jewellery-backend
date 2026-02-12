import mongoose from "mongoose";
import slugify from "slugify";
import ProductVariantModel from "./model.js";
import ProductModel from "../product/model.js";
import Service from "../productVariants/service.js";
import {discountTypeEnum} from "../../../config/enum.js";
import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import {paginationDetails,paginationFun} from "../../../helper/common.js";
import {updateMultipleFiles,uploadMultipleFiles} from "../../aws/controller.js";
const folderName = "variants";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            const {
                product,childSku,diamondQuality,shortDescription,isDraft,material,metalColor,purity,status,weight,length,width,height,size,
                range,price,taxValue,attributes,attTitle,settingType,attWeight,attName,number,cost,ratePerGram,costWeight,costName,
                amount,costDiscount,saveCost,costType,costDiscountType,totalCost,savedAmount,discountType,
                discountDescription,title,name,discountValue,quantity,rating,sales
            } = req.body;

            let slug;
            const existingVariant = await ProductModel.findById(product);
            if (!existingVariant) {
                return errorResponse({res,status: 404,error: Error("Product is not found.")});
            }

            if (existingVariant.hasVariant === false) {
                return errorResponse({res,status: 404,error: Error("This product has no variant.")});
            }

            let subTotal = parseFloat(price);
            let grandTotal = subTotal;

            if (cost) {
                for (const item of cost) {
                    if (item.ratePerGram && item.costWeight) {
                        item.amount = item.ratePerGram * item.costWeight;
                    }
                    if (item.costDiscountType === discountTypeEnum.PERCENTAGE) {
                        item.saveCost = (item.amount * item.costDiscount) / 100;
                    } else if (item.costDiscountType === discountTypeEnum.AMOUNT) {
                        item.saveCost = item.costDiscount;
                    }
                    item.totalCost = item.amount - item.saveCost;
                    if (!item.costDiscountType) {
                        item.totalCost = item.amount;
                    }
                    subTotal += item.totalCost;
                }
            }

            if (!cost && !taxValue) {
                subTotal = parseFloat(price);
                grandTotal = subTotal;
            }

            grandTotal = subTotal;

            if (taxValue) {
                const taxAmount = (subTotal * parseFloat(taxValue)) / 100;
                grandTotal = subTotal + taxAmount;
            }

            if (discountValue) {
                if (discountType === discountTypeEnum.AMOUNT) {
                    grandTotal -= discountValue;
                    savedAmount = discountValue;
                }

                if (discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (grandTotal * discountValue) / 100;
                    grandTotal = grandTotal - savedAmount;
                }
            }

            const uploadedImages = await uploadMultipleFiles(req,folderName);

            slug = slugify(title,{lower: true});
            const doc = {
                files: uploadedImages.map((image) => ({urls: image.url})),
                product,childSku,shortDescription,isDraft,material,metalColor,purity,status,weight,length,width,height,size,range,price,
                taxValue,attributes,attTitle,settingType,attWeight,attName,number,cost,ratePerGram,costWeight,costName,amount,
                costDiscount,saveCost,costType,costDiscountType,totalCost,savedAmount,discountType,quantity,rating,sales,
                discountDescription,grandTotal,subTotal,discountValue,diamondQuality,title,slug,name
            };

            const result = await Service.create(doc);
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Product is created."
            });
        } catch (error) {
            return errorResponse({res,error,funName: "create.productVariant"});
        }
    };

    /**
     * get variant
     */
    static getVariant = async (req,res) => {
        try {
            let filter = {};
            const {id} = req.params;
            const {product} = req.query;

            if (id) filter._id = new mongoose.Types.ObjectId(id);
            if (product) filter.product = new mongoose.Types.ObjectId(product);

            const result = await Service.getVariant(filter);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Variants retrieved successfully."
            });
        } catch (error) {
            return errorResponse({res,error,funName: "get.productVariant"});
        }
    };

    /**
     * GET STATUS AND PRICE
     */
    static getStatusAndPrice = async (req,res) => {
        try {
            const {id} = req.params;
            const {product,metalColor,purity,size,diamondQuality} = req.query;

            const matchStage = {};
            matchStage.isDraft = false;

            if (id) matchStage._id = new mongoose.Types.ObjectId(id);
            if (product) matchStage.product = new mongoose.Types.ObjectId(product);
            if (metalColor) matchStage.metalColor = {$regex: `^${ metalColor }$`,$options: "i"};
            if (purity) matchStage.purity = {$regex: `^${ purity }$`,$options: "i"};
            if (diamondQuality) matchStage.diamondQuality = {$regex: `^${ diamondQuality }$`,$options: "i"};
            if (size) matchStage.size = parseFloat(size);

            const result = await Service.getStatusAndPrice(matchStage);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Variants retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "getStatusAndPrice.productVariant"
            });
        }
    };

    /**
     * get by admin
     */
    static getByAdmin = async (req,res) => {
        try {
            const {id} = req.params;
            const {product,purity,metalColor,isActive,size,diamondQuality,slug} = req.query;
            const matchStage = {};

            if (id) matchStage._id = new mongoose.Types.ObjectId(id);
            if (product) matchStage.product = new mongoose.Types.ObjectId(product);
            if (metalColor) matchStage.metalColor = {$regex: `^${ metalColor }$`,$options: "i"};
            if (purity) matchStage.purity = {$regex: `^${ purity }$`,$options: "i"};
            if (diamondQuality) matchStage.diamondQuality = {$regex: `^${ diamondQuality }$`,$options: "i"};
            if (size) matchStage.size = parseFloat(size);
            if (slug) matchStage.slug = {$regex: slug,$options: "i"};

            if (isActive !== undefined && typeof isActive === 'string') {
                const isAvailableBoolean = isActive.toLowerCase() === 'true';
                matchStage.isActive = isAvailableBoolean;
            }

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await ProductVariantModel.countDocuments(matchStage);

            const result = await Service.getByAdmin(matchStage);

            paginationData = paginationDetails({
                limit: pagination.limit,
                page: req.query.page,
                totalItems: count,
            });

            return successResponse({
                res,
                statusCode: 200,
                pagination: paginationData,
                data: result,
                message: "Variants retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "variant.get"
            });
        }
    };

    /**
     * get by customer
     */
    static getDetails = async (req,res) => {
        try {
            const {id} = req.params;
            const {product,metalColor,purity,size,diamondQuality,slug} = req.query;
            const matchStage = {};

            if (id) matchStage._id = new mongoose.Types.ObjectId(id);
            if (product) matchStage.product = new mongoose.Types.ObjectId(product);
            if (slug) matchStage.slug = {$regex: slug,$options: "i"};
            if (metalColor) matchStage.metalColor = {$regex: `^${ metalColor }$`,$options: "i"};
            if (purity) matchStage.purity = {$regex: `^${ purity }$`,$options: "i"};
            if (diamondQuality) matchStage.diamondQuality = {$regex: `^${ diamondQuality }$`,$options: "i"};
            if (size) matchStage.size = parseFloat(size);

            const pagination = paginationFun(req.query);
            let count,paginationData;
            count = await ProductVariantModel.countDocuments(matchStage);

            const result = await Service.getDetails(matchStage);
            paginationData = paginationDetails({
                limit: pagination.limit,
                page: req.query.page,
                totalItems: count,
            });
            return successResponse({
                res,
                statusCode: 200,
                pagination: paginationData,
                data: result,
                message: "Variants retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "variant.get"
            });
        }
    };

    /**
     * update
     */
    static update = async (req,res) => {
        try {
            const {id} = req.params;
            const {
                diamondQuality,shortDescription,isDraft,material,metalColor,purity,status,weight,length,width,height,size,
                range,price,attributes,attTitle,settingType,attWeight,attName,number,cost,ratePerGram,costWeight,costName,
                amount,costDiscount,saveCost,costType,totalCost,discountDescription,title,name,quantity,rating,sales
            } = req.body;

            let {taxValue,discountType,discountValue,savedAmount} = req.body;
            const existingVariant = await ProductVariantModel.findById(id);
            if (!existingVariant) {
                return errorResponse({res,statusCode: 404,error: Error('Variant not found')});
            }

            let slug;
            let subTotal = price || existingVariant.price;

            if (cost) {
                for (const item of cost) {
                    if (item.ratePerGram && item.costWeight) {
                        item.amount = item.ratePerGram * item.costWeight;
                    }
                    if (item.costDiscountType === discountTypeEnum.PERCENTAGE) {
                        item.saveCost = (item.amount * item.costDiscount) / 100;
                    } else if (item.costDiscountType === discountTypeEnum.AMOUNT) {
                        item.saveCost = item.costDiscount;
                    }
                    item.totalCost = item.amount - item.saveCost;
                    if (!item.costDiscountType) {
                        item.totalCost = item.amount;
                    }
                    subTotal += item.totalCost;
                }
            }

            if (existingVariant.cost && existingVariant.cost.length > 0) {
                for (const item of existingVariant.cost) {
                    subTotal += item.totalCost;
                }
            }

            let grandTotal = subTotal;

            if (taxValue) {
                grandTotal += (subTotal * parseFloat(taxValue) / 100);
            } else if (existingVariant.taxValue) {
                grandTotal += (subTotal * parseFloat(existingVariant.taxValue) / 100);
            }

            if (existingVariant.discountValue && discountType) {
                if (discountType === discountTypeEnum.AMOUNT) {
                    grandTotal -= existingVariant.discountValue;
                    savedAmount = existingVariant.discountValue;
                }

                if (discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (grandTotal * existingVariant.discountValue) / 100;
                    grandTotal = grandTotal - savedAmount;
                }
            }

            if (discountValue && existingVariant.discountType) {
                if (existingVariant.discountType === discountTypeEnum.AMOUNT) {
                    grandTotal -= discountValue;
                    savedAmount = discountValue;
                }

                if (existingVariant.discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (grandTotal * discountValue) / 100;
                    grandTotal = grandTotal - savedAmount;
                }
            }

            if (discountValue && discountType) {
                if (discountType === discountTypeEnum.AMOUNT) {
                    grandTotal -= discountValue;
                    savedAmount = discountValue;
                }

                if (discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (grandTotal * discountValue) / 100;
                    grandTotal = grandTotal - savedAmount;
                }
            }

            if (price || cost || taxValue && existingVariant.discountValue && existingVariant.discountType) {
                if (existingVariant.discountType === discountTypeEnum.AMOUNT) {
                    grandTotal -= existingVariant.discountValue;
                    savedAmount = existingVariant.discountValue;
                }

                if (existingVariant.discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (grandTotal * existingVariant.discountValue) / 100;
                    grandTotal = grandTotal - savedAmount;
                }
            }

            const findDoc = await ProductVariantModel.findById(id);
            let files = await updateMultipleFiles(req,findDoc,folderName);

            const doc = {
                diamondQuality,shortDescription,isDraft,material,metalColor,purity,status,weight,length,width,height,size,quantity,rating,sales,
                range,price,taxValue,attTitle,settingType,attWeight,attName,number,ratePerGram,costWeight,costName,slug,title,name,
                amount,costDiscount,saveCost,costType,totalCost,savedAmount,discountDescription,grandTotal,subTotal,files: files,discountType,
                attributes: attributes ? [ ...existingVariant.attributes,...attributes ] : existingVariant.attributes,discountValue,
                cost: cost ? [ ...existingVariant.cost,...cost ] : existingVariant.cost
            };
            const result = await Service.update(id,doc);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Variant is updated successfully."
            });
        } catch (error) {
            return errorResponse({res,error,funName: "variant.update"});
        }
    };

    /**
     * update cost
     */
    static updateCost = async (req,res) => {
        try {
            const {id,costId} = req.params;
            const {costName,amount,ratePerGram,costWeight,costDiscount,saveCost,costType,costDiscountType,totalCost} = req.body;
            let {savedAmount} = req.body;
            const existingVar = await ProductVariantModel.findById(id);
            if (!existingVar) {
                return errorResponse({res,statusCode: 404,error: Error('Product not found')});
            }

            const costIndex = existingVar.cost.findIndex(cost => cost._id.toString() === costId);
            if (costIndex === -1) {
                return errorResponse({res,statusCode: 404,error: Error('Cost not found')});
            }

            const updatedFields = {costName,amount,ratePerGram,costWeight,costDiscount,saveCost,costType,costDiscountType,totalCost};

            Object.keys(updatedFields).forEach(field => {
                if (updatedFields[ field ]) {
                    existingVar.cost[ costIndex ][ field ] = updatedFields[ field ];
                }
            });

            let subTotal = existingVar.price;

            if (existingVar.cost) {
                for (const item of existingVar.cost) {
                    if (item.ratePerGram && item.costWeight) {
                        item.amount = item.ratePerGram * item.costWeight;
                    }
                    if (item.costDiscountType === discountTypeEnum.PERCENTAGE) {
                        item.saveCost = (item.amount * item.costDiscount) / 100;
                    } else if (item.costDiscountType === discountTypeEnum.AMOUNT) {
                        item.saveCost = item.costDiscount;
                    }
                    item.totalCost = item.amount - item.saveCost;
                    if (!item.costDiscountType) {
                        item.totalCost = item.amount;
                    }
                    subTotal += item.totalCost;
                }
            }

            let grandTotal = subTotal;

            if (existingVar.taxValue) {
                grandTotal += (subTotal * parseFloat(existingVar.taxValue) / 100);
            }

            if (existingVar.discountValue && existingVar.discountType) {
                if (existingVar.discountType === discountTypeEnum.AMOUNT) {
                    grandTotal -= existingVar.discountValue;
                    savedAmount = existingVar.discountValue;
                }

                if (existingVar.discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (grandTotal * existingVar.discountValue) / 100;
                    grandTotal = grandTotal - savedAmount;
                }
            }

            existingVar.subTotal = subTotal;
            existingVar.grandTotal = grandTotal;
            existingVar.savedAmount = savedAmount;

            await existingVar.save();

            return successResponse({
                res,
                statusCode: 200,
                data: existingVar,
                message: 'Cost updated successfully',
            });
        } catch (error) {
            return errorResponse({res,error,funName: 'variant.updateCost'});
        }
    };

    /**
     * update attributes
     */
    static updateAttribute = async (req,res) => {
        try {
            const {id,attributeId} = req.params;
            const {attTitle,attName,settingType,attWeight,number} = req.body;

            const existingVar = await ProductModel.findById(id);
            if (!existingVar) {return errorResponse({res,statusCode: 404,error: Error('Variant not found')});}

            const attIndex = existingVar.attributes.findIndex(attributes => attributes._id.toString() === attributeId);
            if (attIndex === -1) {
                return errorResponse({res,statusCode: 404,error: Error('Attribute not found')});
            }
            if (attTitle) {existingVar.attributes[ attIndex ].attTitle = attTitle;}
            if (attName) {existingVar.attributes[ attIndex ].attName = attName;}
            if (settingType) {existingVar.attributes[ attIndex ].settingType = settingType;}
            if (attWeight) {existingVar.attributes[ attIndex ].attWeight = attWeight;}
            if (number) {existingVar.attributes[ attIndex ].number = number;}

            await existingVar.save();
            return successResponse({
                res,
                statusCode: 200,
                data: existingVar,
                message: 'Attribute is updated successfully.',
            });
        } catch (error) {
            return errorResponse({res,error,funName: "variant.updateAttribute"});
        }
    };

    /**
     * delete single file
     */
    static deleteSingleFile = async (req,res) => {
        try {
            const {id,fileId} = req.params;

            const existingVar = await ProductVariantModel.findById(id);
            if (!existingVar) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("Variant not found.")
                });
            }

            let fileDeleted = false;

            const deleteFromImages = (files) => {
                const index = files.findIndex(file => file._id.toString() === fileId);
                if (index !== -1) {
                    const filename = files[ index ].urls;
                    deleteFile({
                        filename: filename
                    });
                    files.splice(index,1);
                    fileDeleted = true;
                }
            };

            if (existingVar.files && existingVar.files.length > 0) {
                deleteFromImages(existingVar.files);
            }

            if (!fileDeleted && existingVar.files && existingVar.urls.length > 0) {
                deleteFromImages(existingVar.urls);
            }

            if (!fileDeleted) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("File not found.")
                });
            }

            await existingVar.save();
            return successResponse({
                res,
                statusCode: 200,
                message: "File is deleted."
            });

        } catch (error) {
            return errorResponse({res,error});
        }
    };

    /**
     * remove cost
     */
    static removeCost = async (req,res) => {
        try {
            const {id,costId} = req.params;
            let {savedAmount} = req.body;
            const existingVar = await ProductVariantModel.findById(id);
            if (!existingVar) {
                return errorResponse({res,statusCode: 404,error: Error('Variant not found.')});
            }

            const costIndex = existingVar.cost.findIndex(cost => cost._id.toString() === costId);
            if (costIndex === -1) {
                return errorResponse({res,statusCode: 404,error: Error('Cost not found.')});
            }

            existingVar.cost.splice(costIndex,1);
            let subTotal = existingVar.price;

            existingVar.cost.forEach(cost => {
                subTotal += cost.totalCost;
            });

            let grandTotal = subTotal;
            if (existingVar.taxValue) {
                grandTotal += (subTotal * parseFloat(existingVar.taxValue) / 100);
            }

            if (existingVar.discountValue && existingVar.discountType) {
                if (existingVar.discountType === discountTypeEnum.AMOUNT) {
                    grandTotal -= existingVar.discountValue;
                    savedAmount = existingVar.discountValue;
                }

                if (existingVar.discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (grandTotal * existingVar.discountValue) / 100;
                    grandTotal = grandTotal - savedAmount;
                }
            }

            existingVar.subTotal = subTotal;
            existingVar.savedAmount = savedAmount;
            existingVar.grandTotal = grandTotal;

            await existingVar.save();
            return successResponse({
                res,
                statusCode: 200,
                data: existingVar,
                message: 'Cost removed successfully',
            });
        } catch (error) {
            return errorResponse({res,error,funName: "variant.removeCost"});
        }
    };

    /**
     * remove attribute
     */
    static removeAttribute = async (req,res) => {
        try {
            const {id,attributeId} = req.params;

            const exVar = await ProductVariantModel.findById(id);
            if (!exVar) {return errorResponse({res,statusCode: 404,error: Error('Variant not found')});}

            const attIndex = exVar.attributes.findIndex(attributes => attributes._id.toString() === attributeId);
            if (attIndex === -1) {
                return errorResponse({res,statusCode: 404,error: Error('Attribute not found')});
            }
            exVar.attributes.splice(attIndex,1);
            await exVar.save();

            return successResponse({res,statusCode: 200,message: "Attribute is remove successfully."});
        } catch (error) {
            return errorResponse({res,error,funName: "Variant.removeAttribute"});
        }
    };
}
export default controller;
