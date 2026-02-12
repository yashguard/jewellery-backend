import CouponModel from "../master/coupon/model.js";
import {errorResponse,successResponse} from "../../helper/apiResponse.js";
import CartModel from "./model.js";
import mongoose from "mongoose";
import Service from "./service.js";
import OrderModel from "../orders/model.js";
import moment from "moment";
import {orderStatusEnum} from "../../config/enum.js";

class controller {
    /**Add to cart */
    static create = async (req,res) => {
        try {
            const {id} = req.params;
            const userId = req.user._id;

            const existingPro = await Service.existingProduct(id);
            const existingVar = await Service.existingVariant(id);

            if (!existingPro && !existingVar) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Product not found.")
                });
            }

            let cart = await Service.findUserInCart(userId);
            let order = await OrderModel.findOne({user: userId});

            let digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxy';
            let number = '';
            let len = digits.length;
            for (let i = 0;i < 8;i++) {
                number += digits[ Math.floor(Math.random() * len) ];
            }

            let orderId = `ord_${ number }`;
            let invoiceId = `inv_${ number }`;

            if (!cart && order || !order) {
                cart = await Service.createCart(userId);
                order = await OrderModel.create({user: userId,items: [],subTotal: 0,totalCost: 0,orderId,invoiceId,cart: cart._id});
            }

            const existingIndex = cart.items.findIndex(item => {
                if (existingPro) {
                    return item.product && item.product.toString() === id;
                } else if (existingVar) {
                    return item.variant && item.variant.toString() === id;
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

            if (existingIndex === -1) {
                const newItem = {
                    product: existingPro ? id : undefined,
                    variant: existingVar ? id : undefined,
                    quantity: 1,
                    price,
                    unitPrice,
                    savedAmount
                };
                cart.items.push(newItem);
            } else {
                cart.items[ existingIndex ].quantity += 1;
                cart.items[ existingIndex ].price += price;
                cart.items[ existingIndex ].savedAmount += savedAmount;
            }

            cart.subTotal += grandTotalIncrement;
            cart.totalCost = cart.subTotal;

            if (cart.couponDiscount) {
                cart.totalCost -= cart.couponDiscount;
            }

            await cart.save();

            const orderItems = cart.items.map(item => ({
                product: item.product,
                variant: item.variant,
                quantity: item.quantity,
                price: item.price,
                unitPrice: item.unitPrice,
                savedAmount: item.savedAmount
            }));

            let expectedDeliveryDate = moment().add(4,'days');

            if (!order) {
                order = await OrderModel.create({
                    user: userId,
                    items: orderItems,
                    totalAmount: cart.totalCost,
                    sameAsShippingAddress: false,
                    shippingAddress: {},
                    billingAddress: {},
                    expectedDeliveryDate: expectedDeliveryDate
                });
            } else {
                order.items = orderItems;
                order.totalAmount = cart.totalCost;
                order.expectedDeliveryDate = expectedDeliveryDate;
                await order.save();
            }

            const updatedCart = await Service.aggregation(cart);
            return successResponse({
                res,
                statusCode: 201,
                data: updatedCart,
                message: "Product is successfully added to cart."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "cart.create"
            });
        }
    };

    /**Remove from cart */
    static remove = async (req,res) => {
        try {
            const {id,productId} = req.params;
            const cart = await Service.existingCart(id);
            if (!cart) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("Cart not found."),
                });
            }

            let removedProduct;
            let removedVariant;

            const productIndex = cart.items.findIndex(item => item.product && item.product.toString() === productId);
            const variantIndex = cart.items.findIndex(item => item.variant && item.variant.toString() === productId);

            if (productIndex === -1 && variantIndex === -1) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: new Error("Product not found."),
                });
            }

            if (productIndex !== -1) {
                removedProduct = cart.items.splice(productIndex,1)[ 0 ];
                const product = await Service.findProduct(productId);
                const productQuantity = removedProduct.quantity || 1;
                cart.subTotal -= product.grandTotal * productQuantity;
                cart.totalCost -= product.grandTotal * productQuantity;
            }

            if (variantIndex !== -1) {
                removedVariant = cart.items.splice(variantIndex,1)[ 0 ];
                const variant = await Service.findVariant(productId);
                const variantQuantity = removedVariant.quantity || 1;
                cart.subTotal -= variant.grandTotal * variantQuantity;
                cart.totalCost -= variant.grandTotal * variantQuantity;
            }

            if (cart.items.length === 0) {
                await CartModel.findByIdAndDelete(id);
            } else {
                await cart.save();
            }

            const order = await OrderModel.findOne({user: cart.user});
            if (order && order.status !== orderStatusEnum.PROCESSING) {
                order.items = order.items.filter(item => {
                    return !(item.product && item.product.toString() === productId) &&
                        !(item.variant && item.variant.toString() === productId);
                });
                order.totalAmount = cart.totalCost;

                if (order.items.length === 0) {
                    await OrderModel.findByIdAndDelete(order._id);
                } else {
                    await order.save();
                }
            }

            return successResponse({
                res,
                statusCode: 201,
                data: cart,
                message: "Product is successfully removed from cart.",
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "cart.remove",
            });
        }
    };


    /**Get */
    static get = async (req,res) => {
        try {
            const {id} = req.params;
            const {user} = req.query;

            let filter = {};
            if (id) filter.id = id;
            if (user) filter.user = new mongoose.Types.ObjectId(user);

            const result = await Service.getCart(filter);
            return successResponse({
                res,
                statusCode: 200,
                data: result,
                message: "Cart list retrieved successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "cart.get"
            });
        }
    };

    /**Update size & quantity */
    static update = async (req,res) => {
        try {
            const {id,productId} = req.params;
            const {quantity,size} = req.body;

            const cart = await Service.existingCart(id);
            if (!cart) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: Error("Cart not found."),
                });
            }

            const itemToUpdate = cart.items.find(item =>
                item.product && item.product.toString() === productId ||
                item.variant && item.variant.toString() === productId
            );

            if (!itemToUpdate) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Item not found in the cart.")
                });
            }

            const existingProduct = await Service.findProduct(productId);
            const existingVariant = await Service.findVariant(productId);

            if (!existingProduct && !existingVariant) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Product or Variant not found.")
                });
            }

            const grandTotal = existingProduct ? existingProduct.grandTotal : existingVariant.grandTotal;
            const savedAmount = existingProduct ? existingProduct.savedAmount : existingVariant.savedAmount;

            const quantityDifference = quantity - itemToUpdate.quantity;
            itemToUpdate.quantity = quantity;
            itemToUpdate.price = grandTotal * quantity;
            itemToUpdate.unitPrice = grandTotal;
            itemToUpdate.savedAmount = savedAmount * quantity;

            cart.subTotal += quantityDifference * grandTotal;
            cart.totalCost = cart.subTotal - (cart.couponDiscount || 0);

            if (size) {itemToUpdate.size = size;}
            if (cart.items.length === 0) {await CartModel.findByIdAndDelete(id);}
            await cart.save();

            const order = await OrderModel.findOne({user: cart.user});
            if (order && order.status !== orderStatusEnum.PROCESSING) {
                const updateOrder = order.items.find(item =>
                    item.product && item.product.toString() === productId ||
                    item.variant && item.variant.toString() === productId
                );
                if (size) {updateOrder.size = size;}
                order.totalAmount = cart.totalCost;
                if (order.items.length === 0) {await OrderModel.findByIdAndDelete(order._id);}
                await order.save();
            }

            return successResponse({
                res,
                statusCode: 200,
                data: cart,
                message: "Cart is updated."
            });

        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "cart.patch"
            });
        }
    };

    /**move to wishlist */
    static moveToWishlist = async (req,res) => {
        try {
            const userId = req.user._id;
            const {id,productId} = req.params;
            let cart = await Service.existingCart(id);
            if (!cart) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Cart not found.")
                });
            }

            let wishlist = await Service.existingUser(userId);
            if (!wishlist) {
                wishlist = await Service.createWishlist(userId);
            }

            let removedProduct;
            let removedVariant;

            const productIndex = cart.items.findIndex(item => item.product && item.product.toString() === productId);
            const variantIndex = cart.items.findIndex(item => item.variant && item.variant.toString() === productId);

            if (!productIndex && !variantIndex) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Product not found.")
                });
            }

            if (productIndex !== -1) {
                removedProduct = cart.items.splice(productIndex,1)[ 0 ];
                const product = await Service.findProduct(productId);
                const productQuantity = removedProduct.quantity || 1;
                cart.subTotal -= product.grandTotal * productQuantity;
                cart.totalCost -= product.grandTotal * productQuantity;
                wishlist.products.push(productId);
            }

            if (variantIndex !== -1) {
                removedVariant = cart.items.splice(variantIndex,1)[ 0 ];
                const variant = await Service.findVariant(productId);
                const variantQuantity = removedVariant.quantity || 1;
                cart.subTotal -= variant.grandTotal * variantQuantity;
                cart.totalCost -= variant.grandTotal * variantQuantity;
                wishlist.variants.push(productId);
            }

            await wishlist.save();
            if (cart.items.length === 0) {await CartModel.findByIdAndDelete(id);}
            await cart.save();

            const order = await OrderModel.findOne({user: cart.user});
            if (order && order.status !== orderStatusEnum.PROCESSING) {
                if (productIndex !== -1) {
                    removedProduct = order.items.splice(productIndex,1)[ 0 ];
                    wishlist.products.push(productId);
                }
                if (variantIndex !== -1) {
                    removedVariant = order.items.splice(variantIndex,1)[ 0 ];
                    wishlist.variants.push(productId);
                }
                order.totalAmount = cart.totalCost;
                if (order.items.length === 0) {await OrderModel.findByIdAndDelete(order._id);}
                await order.save();
            }

            return successResponse({
                res,
                statusCode: 201,
                data: cart,
                message: "Moved to wishlist."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "cart.moveToWishlist"
            });
        }
    };

    /**Apply coupon */
    static applyCoupon = async (req,res) => {
        try {
            const {id} = req.params;
            const {couponCode} = req.body;

            const cart = await CartModel.findById(id);
            if (!cart) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: Error("Cart not found."),
                    funName: "cart.applyCoupon"
                });
            }

            if (cart.couponCode === couponCode) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: Error("A coupon has already been applied to this cart."),
                    funName: "cart.applyCoupon"
                });
            }

            const coupon = await CouponModel.findById(couponCode);
            if (!coupon) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: Error("Invalid coupon code. Try other available coupons."),
                    funName: "cart.applyCoupon"
                });
            }

            if (coupon) {
                if (cart.totalCost < coupon.validAmount) {
                    cart.totalCost -= coupon.savedAmount;
                    cart.couponDiscount = coupon.savedAmount;
                    cart.couponCode = couponCode;
                    await cart.save();
                    const order = await OrderModel.findOne({user: cart.user});
                    if (order && order.status !== orderStatusEnum.PROCESSING) {
                        order.couponDiscount = coupon.savedAmount;
                        order.couponCode = couponCode;
                        order.totalAmount = cart.totalCost;
                        await order.save();
                    }
                    return successResponse({
                        res,
                        statusCode: 200,
                        data: cart,
                        message: "Coupon applied successfully."
                    });
                } else {
                    return errorResponse({
                        res,
                        statusCode: 400,
                        error: Error("This coupon is not applicable for the items in the cart."),
                        funName: "cart.applyCoupon"
                    });
                }
            }
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "cart.applyCoupon"
            });
        }
    };

    /**Remove coupon */
    static removeCoupon = async (req,res) => {
        try {
            const {id} = req.params;
            const cart = await CartModel.findById(id)
                .populate({path: "items.product",select: "grandTotal"})
                .populate({path: "items.variant",select: "totalPrice"})
                .populate({path: "couponCode"})
                .populate({path: "user",select: "username email"});

            if (cart.couponCode !== null) {
                cart.totalCost = cart.subTotal;
                cart.couponDiscount = null;
                cart.couponCode = null;
                await cart.save();
                const order = await OrderModel.findOne({user: cart.user});
                if (order && order.status !== orderStatusEnum.PROCESSING) {
                    order.couponDiscount = null;
                    order.couponCode = null;
                    order.totalAmount = cart.subTotal;
                    await order.save();
                }
            } else {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: Error("Coupon not found in this cart."),
                    funName: "cart.removeCoupon"
                });
            }
            return successResponse({
                res,
                statusCode: 200,
                data: cart,
                message: "Coupon removed successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "cart.removeCoupon"
            });
        }
    };

    /**Update price */
    static updatePrice = async (req,res) => {
        try {
            const {id} = req.params;

            const existingCart = await CartModel.findById(id);
            if (!existingCart) {
                return errorResponse({
                    res,
                    statusCode: 404,
                    error: Error("Cart not found."),
                    funName: "cart.updatePrice"
                });
            }

            let subTotal = 0;
            for (const itemToUpdate of existingCart.items) {
                const existingProduct = await Service.findProduct(itemToUpdate.product);
                const existingVariant = await Service.findVariant(itemToUpdate.variant);

                if (!existingProduct && !existingVariant) {
                    continue;
                }

                const grandTotal = existingProduct ? existingProduct.grandTotal : existingVariant.grandTotal;
                const savedAmount = existingProduct ? existingProduct.savedAmount : existingVariant.savedAmount;

                itemToUpdate.quantity = itemToUpdate.quantity;
                itemToUpdate.price = grandTotal * itemToUpdate.quantity;
                itemToUpdate.savedAmount = savedAmount * itemToUpdate.quantity;

                subTotal += itemToUpdate.price;
            }

            existingCart.subTotal = subTotal;

            if (existingCart.couponDiscount) {
                existingCart.totalCost = subTotal - existingCart.couponDiscount;
            } else {
                existingCart.totalCost = subTotal;
            }

            await existingCart.save();

            const existingOrder = await OrderModel.findOne({user: cart.user});
            if (existingOrder && existingOrder.status !== orderStatusEnum.PROCESSING) {
                for (const itemToUpdate of existingOrder.items) {
                    const existingProduct = await Service.findProduct(itemToUpdate.product);
                    const existingVariant = await Service.findVariant(itemToUpdate.variant);

                    if (!existingProduct && !existingVariant) {
                        continue;
                    }

                    const grandTotal = existingProduct ? existingProduct.grandTotal : existingVariant.grandTotal;
                    const savedAmount = existingProduct ? existingProduct.savedAmount : existingVariant.savedAmount;

                    itemToUpdate.quantity = itemToUpdate.quantity;
                    itemToUpdate.price = grandTotal * itemToUpdate.quantity;
                    itemToUpdate.savedAmount = savedAmount * itemToUpdate.quantity;
                    await existingOrder.save();
                }
            }

            return successResponse({
                res,
                statusCode: 200,
                data: existingCart,
                message: "Cart updated successfully."
            });
        } catch (error) {
            return errorResponse({
                res,
                error,
                funName: "cart.updatePrice"
            });
        }
    };
}

export default controller;
