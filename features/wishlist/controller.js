import mongoose from "mongoose";
import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import Service from "./service.js";
import WishlistModel from "./model.js";
import CartModel from "../cart/model.js";
import ProductModel from "../master/product/model.js";
import ProductVariantModel from "../master/productVariants/model.js";
import OrderModel from "../orders/model.js";
import moment from "moment";

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
            const {id,productId} = req.params;

            const existingWishlist = await WishlistModel.findById(id);
            if (!existingWishlist) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("Wishlist not found.")
                });
            }

            const userId = existingWishlist.user;
            const existingPro = await ProductModel.findById(productId);
            const existingVar = await ProductVariantModel.findById(productId);

            if (!existingPro && !existingVar) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Product not found in wishlist.")
                });
            }

            if (!(existingWishlist.products.includes(productId) || existingWishlist.variants.includes(productId))) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Product not found in the wishlist.")
                });
            }

            existingWishlist.variants.pull(productId);
            existingWishlist.products.pull(productId);

            await existingWishlist.save();

            let cart = await CartModel.findOne({user: userId});
            if (!cart) {
                cart = await CartModel.create({user: userId,items: [],subTotal: 0,totalCost: 0});
            }

            let order = await OrderModel.findOne({
                user: userId,
                cart: cart._id,
                isPaid: false
            });

            let digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy';
            let number = '';
            let len = digits.length;
            for (let i = 0;i < 8;i++) {
                number += digits[ Math.floor(Math.random() * len) ];
            }

            let orderId = `ord_${ number }`;
            let invoiceId = `inv_${ number }`;

            if (!order) {
                order = await OrderModel.create({
                    user: userId,
                    items: [],
                    subTotal: 0,
                    savedAmount: 0,
                    totalCost: 0,
                    totalSaving: 0,
                    orderId,
                    invoiceId,
                    cart: cart._id
                });
            }

            const existingCartIndex = cart.items.findIndex(item => {
                if (existingPro) {
                    return item.product && item.product.toString() === productId;
                } else if (existingVar) {
                    return item.variant && item.variant.toString() === productId;
                }
            });

            let grandTotalIncrement = 0;
            let price = 0;
            let unitPrice = 0;
            let savedAmount = 0;

            if (existingPro) {
                price = existingPro.grandTotal;
                unitPrice = existingPro.grandTotal;
                savedAmount = existingPro.savedAmount;
                grandTotalIncrement += existingPro.grandTotal;
            }
            if (existingVar) {
                price = existingVar.grandTotal;
                unitPrice = existingVar.grandTotal;
                savedAmount = existingVar.savedAmount;
                grandTotalIncrement += existingVar.grandTotal;
            }

            if (existingCartIndex === -1) {
                const newItem = {
                    product: existingPro ? productId : undefined,
                    variant: existingVar ? productId : undefined,
                    quantity: 1,
                    price,
                    unitPrice,
                    savedAmount
                };
                cart.items.push(newItem);
            } else {
                cart.items[ existingCartIndex ].quantity += 1;
                cart.items[ existingCartIndex ].price += price;
                cart.items[ existingCartIndex ].savedAmount += savedAmount;
            }

            const existingOrderIndex = order.items.findIndex(item => {
                if (existingPro) {
                    return item.product && item.product.toString() === productId;
                } else if (existingVar) {
                    return item.variant && item.variant.toString() === productId;
                }
            });

            if (existingOrderIndex === -1) {
                const newItem = {
                    product: existingPro ? productId : undefined,
                    variant: existingVar ? productId : undefined,
                    quantity: 1,
                    price,
                    unitPrice,
                    savedAmount
                };
                order.items.push(newItem);
            } else {
                order.items[ existingOrderIndex ].quantity += 1;
                order.items[ existingOrderIndex ].price += price;
                order.items[ existingOrderIndex ].savedAmount += savedAmount;
            }

            cart.subTotal += grandTotalIncrement;
            cart.totalCost = cart.subTotal;
            cart.savedAmount = cart.items.reduce((total,item) => total + item.savedAmount,0);
            cart.totalSaving = cart.savedAmount + (cart.couponDiscount || 0);

            let expectedDeliveryDate = moment().add(4,'days');

            order.totalAmount = cart.totalCost;
            order.expectedDeliveryDate = expectedDeliveryDate;
            order.savedAmount = cart.savedAmount;
            order.totalSaving = cart.totalSaving;

            await cart.save();
            await order.save();

            return successResponse({
                res,
                statusCode: 201,
                data: existingWishlist,
                message: "Product moved to cart successfully."
            });

        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "cart.moveToCart"
            });
        }
    };
}

export default controller;
