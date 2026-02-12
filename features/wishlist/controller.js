import mongoose from "mongoose";
import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import Service from "./service.js";

class controller {
    /**Add - Remove product/variant in wishlist */
    static create = async (req,res) => {
        const userId = req.user._id;
        const {id} = req.params;

        let wishlist = await Service.findUser(userId);
        if (!wishlist) {
            wishlist = await Service.createWishlist(userId);
        }

        const findProduct = await Service.findProduct(id);
        const findVariant = await Service.findVariants(id);

        if (findVariant) {
            if (!wishlist.variants.includes(id)) {
                wishlist.variants.push(id);
                await wishlist.save();
                const updatedWishlist = await Service.populate(wishlist);
                return successResponse({
                    res,
                    statusCode: 200,
                    data: updatedWishlist,
                    message: "Added to Wishlist."
                });
            } else {
                wishlist.variants.pull(id);
                await wishlist.save();
                return successResponse({
                    res,
                    statusCode: 200,
                    data: wishlist,
                    message: "Remove from Wishlist."
                });
            }
        } else if (findProduct) {
            if (!wishlist.products.includes(id)) {
                wishlist.products.push(id);
                await wishlist.save();
                const updatedWishlist = await Service.populate(wishlist);
                return successResponse({
                    res,
                    statusCode: 200,
                    data: updatedWishlist,
                    message: "Added to Wishlist."
                });
            } else {
                wishlist.products.pull(id);
                await wishlist.save();
                return successResponse({
                    res,
                    statusCode: 200,
                    data: wishlist,
                    message: "Remove from Wishlist."
                });
            }
        } else {
            return errorResponse({
                res,
                statusCode: 404,
                error: new Error('Product not found')
            });
        }
    };

    /**Get */
    static get = async (req,res) => {
        try {
            const {id} = req.params;
            const {user} = req.query;

            const filter = {};
            if (id) filter._id = new mongoose.Types.ObjectId(id);
            if (user) filter.user = new mongoose.Types.ObjectId(user);

            const result = await Service.getWishlist(filter);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Wishlist retrieved successfully."
            });

        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "wishlist.get"
            });
        }
    };

    /**Move to cart */
    static moveToCart = async (req,res) => {
        try {
            const userId = req.user._id;
            const {id} = req.params;
            let wishlist = await Service.findUser(userId);
            if (!wishlist) {wishlist = await Service.createWishlist(userId);}

            const findProductIndex = wishlist.products.indexOf(id);
            const findVariantIndex = wishlist.variants.indexOf(id);

            if (findProductIndex !== -1 || findVariantIndex !== -1) {
                let cartItem = await Service.existingUserCart(userId);

                if (cartItem) {
                    const itemIndex = cartItem.items.findIndex(item => item.product === id || item.variant === id);
                    if (itemIndex !== -1) {
                        cartItem.items[ itemIndex ].quantity += 1;
                    } else {
                        const product = await Service.findProduct(id);
                        const variant = await Service.findVariants(id);
                        if (!product && !variant) {
                            return errorResponse({
                                res,
                                statusCode: 404,
                                error: Error("Product not found.")
                            });
                        }
                        const grandTotal = product ? product.grandTotal : variant.grandTotal;
                        const newItem = product ? {product: id,quantity: 1} : {variant: id,quantity: 1};
                        cartItem.items.push(newItem);
                        wishlist.variants.pull(variant);
                        wishlist.products.pull(product);
                        cartItem.subTotal += grandTotal;
                        cartItem.totalCost += grandTotal;
                    }
                } else {
                    const product = await Service.findProduct(id);
                    const variant = await Service.findVariants(id);
                    if (!product && !variant) {
                        return errorResponse({
                            res,
                            statusCode: 404,
                            error: Error("Product or Variant not found.")
                        });
                    }
                    const grandTotal = product ? product.grandTotal : variant.grandTotal;
                    const newItem = product ? {product: id,quantity: 1} : {variant: id,quantity: 1};
                    let cartItem = await Service.createCart(userId,newItem,grandTotal);
                    wishlist.variants.pull(variant);
                    wishlist.products.pull(product);
                    await cartItem.save();
                    return successResponse({
                        res,
                        statusCode: 200,
                        data: cartItem,
                        message: "Product/Variant is moved to cart."
                    });
                }

                await cartItem.save();
                await wishlist.save();

                return successResponse({
                    res,
                    statusCode: 200,
                    data: cartItem,
                    message: "Product is moved to cart."
                });
            } else {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Item not found in the wishlist.")
                });
            }
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "wishlist.moveToCart"
            });
        }
    };
}

export default controller;
