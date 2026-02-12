import ProductModel from "../master/product/model.js";
import ProductVariantModel from "../master/productVariants/model.js";
import WishlistModel from "../wishlist/model.js";
import CartModel from "./model.js";

class Service {
    /**    
     * create
     */
    static create = async (doc) => {
        return CartModel.create(doc);
    };

    /**
     * existing product
     */
    static existingProduct = async (id) => {
        return ProductModel.findById(id);
    };

    /**
     * existing variant
     */
    static existingVariant = async (id) => {
        return ProductVariantModel.findById(id);
    };

    /**
     * existing cart
     */
    static existingCart = async (id) => {
        return CartModel.findById(id);
    };

    /**
     * find user in cart
     */
    static findUserInCart = async (userId) => {
        return CartModel.findOne({user: userId});
    };

    /**
     * create cart
     */
    static createCart = async (userId) => {
        return CartModel.create({user: userId,items: [],subTotal: 0,totalCost: 0});
    };

    /**
     * get cart
     */
    static getCart = async (filter) => {
        return CartModel.find(filter)
            .populate({path: "couponCode",select: "code description discountValue discountType savedAmount"})
            .populate({path: "items.product",select: "name files title purity metalColor grandTotal"})
            .populate({path: "items.variant",select: "name files title purity metalColor grandTotal"});
    };

    /**
     * aggregation
     */
    static aggregation = async (cart) => {
        return CartModel.find(cart._id)
            .populate({path: "items.product",select: "name files title purity metalColor grandTotal"})
            .populate({path: "items.variant",select: "name files title purity metalColor grandTotal"});
    };

    /**
     * find user from wishlist
     */
    static existingUser = async (userId) => {
        return WishlistModel.findOne({user: userId});
    };

    /**
     * create wishlist
     */
    static createWishlist = async (userId) => {
        return WishlistModel.create({user: userId,products: [],variants: []});
    };

    /**
     * find product
     */
    static findProduct = async (productId) => {
        return ProductModel.findById(productId);
    };

    /**
     * find variant
     */
    static findVariant = async (productId) => {
        return ProductVariantModel.findById(productId);
    };
}

export default Service;
