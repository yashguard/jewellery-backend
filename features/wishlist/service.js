import {config} from "../../config/config.js";
import CartModel from "../cart/model.js";
import ProductModel from "../master/product/model.js";
import ProductVariantModel from "../master/productVariants/model.js";
import WishlistModel from "./model.js";

class Service {
    /**
     * find product
     */
    static findProduct = async (id) => {
        return await ProductModel.findById(id);
    };

    /**
     * find variant
     */
    static findVariants = async (id) => {
        return await ProductVariantModel.findById(id);
    };

    /**
     * populate
     */
    static populate = async (wishlist) => {
        return await WishlistModel.find(wishlist._id)
            .populate({path: "variants",select: "name files title purity metalColor grandTotal subTotal"})
            .populate({path: "products",select: "name files title purity metalColor grandTotal subTotal"});
    };

    /**
     * get wishlist
     */
    static getWishlist = async (filter) => {
        return WishlistModel.find(filter)
            .populate({path: "variants",select: "name files title purity metalColor grandTotal subTotal"})
            .populate({path: "products",select: "name files title purity metalColor grandTotal subTotal"});
    };

    /**
     * find wishlist
     */
    static findUser = async (userId) => {
        return WishlistModel.findOne({user: userId});
    };

    /**
     * create wishlist
     */
    static createWishlist = async (userId) => {
        return WishlistModel.create({user: userId,products: [],variants: []});
    };

    /**
     * existing user cart
     */
    static existingUserCart = async (userId) => {
        return CartModel.findOne({user: userId});
    };

    /**
     * create cart
     */
    static createCart = async (userId,newItem,grandTotal) => {
        return CartModel.create({
            user: userId,
            items: [ newItem ],
            subTotal: grandTotal,
            totalCost: grandTotal
        });
    };
}

export default Service;
