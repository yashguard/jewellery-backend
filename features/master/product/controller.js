import {errorResponse,successResponse} from "../../../helper/apiResponse.js";
import {deleteFile} from "../../../helper/aws_s3.js";
import Services from "../product/service.js";
import ProductModel from "./model.js";
import mongoose from "mongoose";
import {paginationFun,paginationDetails} from "../../../helper/common.js";
import {discountTypeEnum} from "../../../config/enum.js";
import slugify from "slugify";
import {updateMultipleFiles,uploadMultipleFiles} from "../../aws/controller.js";
const folderName = "product";

class controller {
    /**
     * create
     */
    static create = async (req,res) => {
        try {
            const {
                name,description,manufacturerName,sku,category,subCategory,shopFor,tag,material,occasion,collections,giftType,
                isDraft,hasVariant,isRing,isFeatured,metalColor,purity,weight,length,width,height,size,range,taxValue,
                cost,ratePerGram,costWeight,costName,amount,costDiscount,saveCost,costType,costDiscountType,totalCost,attributes,
                attTitle,settingType,attWeight,number,discountType,discountDescription,quantity,rating,sales,
                attName,title,discountValue
            } = req.body;

            const price = req.body.price || 0;
            let savedAmount;
            let subTotal = parseFloat(price);
            let grandTotal = subTotal;
            let slug = slugify(title,{lower: true});

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

            if (discountValue) {
                if (discountType === discountTypeEnum.AMOUNT) {
                    subTotal -= discountValue;
                    savedAmount = discountValue;
                }

                if (discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (subTotal * discountValue) / 100;
                    subTotal = subTotal - savedAmount;
                }
            }
            if (!taxValue) {
                grandTotal = subTotal;
            }

            if (taxValue) {
                const taxAmount = (subTotal * parseFloat(taxValue)) / 100;
                grandTotal = subTotal + taxAmount;
            }

            const uploadedImages = await uploadMultipleFiles(req,folderName);

            const doc = {
                files: uploadedImages.map((image) => ({urls: image.url})),taxValue,
                name,description,manufacturerName,sku,category,subCategory,shopFor,tag,material,occasion,collections,giftType,isDraft,hasVariant,isRing,
                isFeatured,metalColor,purity,weight,length,width,height,size,range,price,cost,ratePerGram,costWeight,costName,
                amount,costDiscount,saveCost,costType,costDiscountType,totalCost,attributes,attTitle,settingType,attWeight,number,
                savedAmount,discountType,discountDescription,grandTotal,subTotal,discountValue,attName,title,slug,quantity,rating,sales
            };

            const result = await Services.create(doc);
            return successResponse({
                res,
                statusCode: 201,
                data: result,
                message: "Product is created."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "product.create"
            });
        }
    };

    /**
     * get product
     */
    static getProduct = async (req,res) => {
        try {
            const {id} = req.params;
            const {metalColor,sort,purity,shopFor,price,productType,weight,material,occasion,giftType,collections,category,availability,slug} = req.query;

            const matchStage = {};
            matchStage.isDraft = false;

            if (id) matchStage._id = new mongoose.Types.ObjectId(id);
            if (category) matchStage.category = new mongoose.Types.ObjectId(category);
            if (productType) matchStage.productType = new mongoose.Types.ObjectId(productType);
            if (purity) matchStage.purity = {$regex: `^${ purity }$`,$options: "i"};
            if (slug) matchStage.slug = {$regex: `^${ slug }$`,$options: "i"};
            if (shopFor) matchStage.shopFor = {$regex: `^${ shopFor }$`,$options: "i"};
            if (weight) matchStage.weight = {$regex: `^${ weight }$`,$options: "i"};
            if (material) matchStage.material = {$regex: `^${ material }$`,$options: "i"};
            if (occasion) matchStage.occasion = {$regex: `^${ occasion }$`,$options: "i"};
            if (giftType) matchStage.giftType = {$regex: `^${ giftType }$`,$options: "i"};
            if (metalColor) matchStage.metalColor = {$regex: `^${ metalColor }$`,$options: "i"};
            if (collections) matchStage.collections = {$regex: `^${ collections }$`,$options: "i"};
            if (availability !== undefined) matchStage.availability = availability === "true";

            if (price) {
                const priceRange = price.split("-");
                if (priceRange.length === 2) {
                    const minPrice = parseFloat(priceRange[ 0 ]);
                    const maxPrice = parseFloat(priceRange[ 1 ]);
                    matchStage.grandTotal = {$gte: minPrice,$lte: maxPrice};
                }

                if (price) {
                    const priceFilter = parseFloat(price.split("-")[ 1 ]);
                    const filterType = price.includes("under") ? "under" : price.includes("over") ? "over" : null;
                    if (filterType === "under") {
                        matchStage.grandTotal = {$lte: priceFilter};
                    } else if (filterType === "over") {
                        matchStage.grandTotal = {$gte: priceFilter};
                    }
                }
            }

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await ProductModel.countDocuments(matchStage);

            /**sort data */
            let sortStage = {};
            if (sort) {
                if (sort === "price_asc") {
                    sortStage.grandTotal = 1;
                } else if (sort === "price_dec") {
                    sortStage.grandTotal = -1;
                } else if (sort === "newest") {
                    sortStage.createdAt = -1;
                }
            } else {
                sortStage = {createdAt: -1};
            }

            const result = await Services.getProduct(matchStage,sortStage,pagination);
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
                message: "Products retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "product.getProductDetails"
            });
        }
    };

    /**
     * get details
     */
    static getProductDetails = async (req,res) => {
        try {
            const {id} = req.params;
            const matchStage = {};
            const {slug} = req.query;

            if (id) matchStage._id = new mongoose.Types.ObjectId(id);
            if (slug) matchStage.slug = {$regex: `^${ slug }$`,$options: "i"};

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await ProductModel.countDocuments(matchStage);

            const result = await Services.getProductDetails(matchStage,pagination);
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
                message: "Products retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "product.get"
            });
        }
    };

    /**
     * get by admin
     */
    static getByAdmin = async (req,res) => {
        try {
            const {id} = req.params;
            const {subTotal,metalColor,sort,purity,shopFor,draft,category,subCategory,availability,slug} = req.query;

            const matchStage = {};

            if (id) matchStage._id = new mongoose.Types.ObjectId(id);
            if (category) matchStage.category = new mongoose.Types.ObjectId(category);
            if (subCategory) matchStage.subCategory = new mongoose.Types.ObjectId(subCategory);
            if (slug) matchStage.slug = {$regex: `^${ slug }$`,$options: "i"};
            if (purity) matchStage.purity = parseFloat(purity);
            if (metalColor) matchStage.metalColor = {$regex: `^${ metalColor }$`,$options: "i"};
            if (shopFor) matchStage.shopFor = {$regex: `^${ shopFor }$`,$options: "i"};
            if (subTotal) matchStage.subTotal = parseFloat(subTotal);
            if (draft !== undefined) matchStage.isDraft = draft === "true";
            if (availability !== undefined) matchStage.availability = availability === "true";

            const pagination = paginationFun(req.query);
            let count,paginationData;

            count = await ProductModel.countDocuments(matchStage);

            /**sort data */
            let sortStage = {};
            if (sort) {
                if (sort === "price_asc") {
                    sortStage.grandTotal = 1;
                } else if (sort === "price_dec") {
                    sortStage.grandTotal = -1;
                } else if (sort === "newest") {
                    sortStage.createdAt = -1;
                }
            } else {
                sortStage = {createdAt: -1};
            }

            const result = await Services.getByAdmin(matchStage,sortStage,pagination);
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
                message: "Products retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "product.getByAdmin"
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
                name,description,manufacturerName,tag,occasion,shopFor,material,collections,giftType,metalColor,purity,weight,length,width,
                height,size,range,isDraft,hasVariant,isRing,isFeatured,cost,ratePerGram,costWeight,costName,amount,costDiscount,
                saveCost,costType,costDiscountType,attributes,attTitle,settingType,attWeight,attName,number,discountDescription,
                totalCost,title,price,quantity,sales,rating
            } = req.body;

            let {taxValue,discountType,discountValue,savedAmount} = req.body;

            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("Product not found.")
                });
            }

            let subTotal = price || existingProduct.price || 0;

            if (cost) {
                cost.forEach(item => {
                    if (item.ratePerGram && item.costWeight) {
                        item.amount = item.ratePerGram * item.costWeight;
                    }
                    if (item.costDiscountType === discountTypeEnum.PERCENTAGE) {
                        item.saveCost = (item.amount * item.costDiscount) / 100;
                    } else if (item.costDiscountType === discountTypeEnum.AMOUNT) {
                        item.saveCost = item.costDiscount;
                    }
                    item.totalCost = item.amount - (item.saveCost || 0);
                    subTotal += item.totalCost;
                });
            }

            if (existingProduct.cost && existingProduct.cost.length > 0) {
                existingProduct.cost.forEach(item => {
                    subTotal += item.totalCost;
                });
            }

            const applyDiscount = (value,type) => {
                if (type === discountTypeEnum.AMOUNT) {
                    return {newSubTotal: subTotal - value,savedAmount: value};
                } else if (type === discountTypeEnum.PERCENTAGE) {
                    const discountAmount = (subTotal * value) / 100;
                    return {newSubTotal: subTotal - discountAmount,savedAmount: discountAmount};
                }
                return {newSubTotal: subTotal,savedAmount: 0};
            };

            if (discountValue && !discountType) {
                discountType = existingProduct.discountType;
            }

            if (discountValue) {
                ({newSubTotal: subTotal,savedAmount} = applyDiscount(discountValue,discountType));
            } else if (existingProduct.discountValue && existingProduct.discountType) {
                ({newSubTotal: subTotal,savedAmount} = applyDiscount(existingProduct.discountValue,existingProduct.discountType));
            }

            let grandTotal = subTotal;
            if (taxValue) {
                grandTotal += (subTotal * parseFloat(taxValue)) / 100;
            } else if (existingProduct.taxValue) {
                grandTotal += (subTotal * parseFloat(existingProduct.taxValue)) / 100;
            }

            const updatedFiles = await updateMultipleFiles(req,existingProduct,folderName);
            const slug = title ? slugify(title,{lower: true}) : existingProduct.slug;

            const doc = {
                name,description,manufacturerName,tag,occasion,shopFor,material,collections,giftType,metalColor,purity,
                weight,length,width,height,size,range,isDraft,hasVariant,isRing,isFeatured,cost,ratePerGram,costWeight,costName,amount,costDiscount,
                saveCost,costType,costDiscountType,attributes,attTitle,settingType,attWeight,attName,number,discountDescription,quantity,sales,rating,
                savedAmount,discountValue,price,taxValue,totalCost,files: updatedFiles,grandTotal,subTotal,slug,title,discountType,
                attributes: attributes ? [ ...existingProduct.attributes,...attributes ] : existingProduct.attributes,
                cost: cost ? [ ...existingProduct.cost,...cost ] : existingProduct.cost
            };

            const result = await Services.update(id,doc);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Product updated successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "product.update"
            });
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
            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {
                return errorResponse({res,statusCode: 404,error: Error('Product not found')});
            }

            const costIndex = existingProduct.cost.findIndex(cost => cost._id.toString() === costId);
            if (costIndex === -1) {
                return errorResponse({res,statusCode: 404,error: Error('Cost not found')});
            }

            const updatedFields = {costName,amount,ratePerGram,costWeight,costDiscount,saveCost,costType,costDiscountType,totalCost};

            Object.keys(updatedFields).forEach(field => {
                if (updatedFields[ field ]) {
                    existingProduct.cost[ costIndex ][ field ] = updatedFields[ field ];
                }
            });

            let subTotal = existingProduct.price;

            if (existingProduct.cost) {
                for (const item of existingProduct.cost) {
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

            if (existingProduct.discountValue && existingProduct.discountType) {
                if (existingProduct.discountType === discountTypeEnum.AMOUNT) {
                    subTotal -= existingProduct.discountValue;
                    savedAmount = existingProduct.discountValue;
                }

                if (existingProduct.discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (subTotal * existingProduct.discountValue) / 100;
                    subTotal = subTotal - savedAmount;
                }
            }

            let grandTotal = subTotal;

            if (existingProduct.taxValue) {
                grandTotal += (subTotal * parseFloat(existingProduct.taxValue) / 100);
            }

            existingProduct.subTotal = subTotal;
            existingProduct.grandTotal = grandTotal;
            existingProduct.savedAmount = savedAmount;

            await existingProduct.save();

            return successResponse({
                res,
                statusCode: 200,
                data: existingProduct,
                message: 'Product cost updated successfully',
            });
        } catch (error) {
            return errorResponse({res,error,funName: 'product.updateCost'});
        }
    };

    /**
     * update attributes
     */
    static updateAttribute = async (req,res) => {
        try {
            const {id,attributeId} = req.params;
            const {attTitle,attName,settingType,attWeight,number} = req.body;

            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {return errorResponse({res,statusCode: 404,error: Error('Product not found')});}

            const attIndex = existingProduct.attributes.findIndex(attributes => attributes._id.toString() === attributeId);
            if (attIndex === -1) {
                return errorResponse({res,statusCode: 404,error: Error('Attribute not found')});
            }
            if (attTitle) {existingProduct.attributes[ attIndex ].attTitle = attTitle;}
            if (attName) {existingProduct.attributes[ attIndex ].attName = attName;}
            if (settingType) {existingProduct.attributes[ attIndex ].settingType = settingType;}
            if (attWeight) {existingProduct.attributes[ attIndex ].attWeight = attWeight;}
            if (number) {existingProduct.attributes[ attIndex ].number = number;}

            await existingProduct.save();
            return successResponse({
                res,
                statusCode: 200,
                data: existingProduct,
                message: 'Attribute is updated successfully.',
            });
        } catch (error) {
            return errorResponse({res,error,funName: "product.updateAttribute"});
        }
    };

    /**
     * delete single file
     */
    static deleteSingleFile = async (req,res) => {
        try {
            const {id,fileId} = req.params;

            const product = await ProductModel.findById(id);
            if (!product) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("Product not found.")
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

            if (product.files && product.files.length > 0) {
                deleteFromImages(product.files);
            }

            if (!fileDeleted && product.filename && product.urls.length > 0) {
                deleteFromImages(product.urls);
            }

            if (!fileDeleted) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("File not found.")
                });
            }

            await product.save();
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

            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {
                return errorResponse({res,statusCode: 404,error: Error('Product not found')});
            }

            const costIndex = existingProduct.cost.findIndex(cost => cost._id.toString() === costId);
            if (costIndex === -1) {
                return errorResponse({res,statusCode: 404,error: Error('Cost not found')});
            }

            existingProduct.cost.splice(costIndex,1);
            let subTotal = existingProduct.price;

            existingProduct.cost.forEach(cost => {
                subTotal += cost.totalCost;
            });

            if (existingProduct.discountValue && existingProduct.discountType) {
                if (existingProduct.discountType === discountTypeEnum.AMOUNT) {
                    subTotal -= existingProduct.discountValue;
                    savedAmount = existingProduct.discountValue;
                }

                if (existingProduct.discountType === discountTypeEnum.PERCENTAGE) {
                    savedAmount = (subTotal * existingProduct.discountValue) / 100;
                    subTotal = subTotal - savedAmount;
                }
            }

            let grandTotal = subTotal;

            if (existingProduct.taxValue) {
                grandTotal += (subTotal * parseFloat(existingProduct.taxValue) / 100);
            }

            existingProduct.subTotal = subTotal;
            existingProduct.savedAmount = savedAmount;
            existingProduct.grandTotal = grandTotal;

            await existingProduct.save();

            return res.json({
                success: true,
                message: 'Cost removed successfully',
                data: existingProduct,
            });
        } catch (error) {
            return errorResponse({res,error,funName: "product.removeCost"});
        }
    };

    /**
     * remove attribute
     */
    static removeAttribute = async (req,res) => {
        try {
            const {id,attributeId} = req.params;

            const existingProduct = await ProductModel.findById(id);
            if (!existingProduct) {return errorResponse({res,statusCode: 404,error: Error('Product not found')});}

            const attIndex = existingProduct.attributes.findIndex(attributes => attributes._id.toString() === attributeId);
            if (attIndex === -1) {
                return errorResponse({res,statusCode: 404,error: Error('Attribute not found')});
            }
            existingProduct.attributes.splice(attIndex,1);
            await existingProduct.save();

            return successResponse({res,statusCode: 200,message: "Attribute is remove successfully."});
        } catch (error) {
            return errorResponse({res,error,funName: "product.removeAttribute"});
        }
    };
}

export default controller;
