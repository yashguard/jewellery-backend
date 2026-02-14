import joi from "joi";

class validate {
    /**create cart */
    static create = {
        body: joi.object().keys({
            user: joi.string(),
            items: joi.array().items(
                joi.object({
                    product: joi.string(),
                    variant: joi.string(),
                    quantity: joi.number().integer().min(1),
                    size: joi.number(),
                    price: joi.number(),
                    taxAmount: joi.number(),
                    unitPrice: joi.number(),
                    savedAmount: joi.number(),
                    withoutDiscountPrice: joi.number()
                })
            ),
            count: joi.number(),
            withoutDiscountPrice: joi.number(),
            subTotal: joi.number(),
            savedAmount: joi.number(),
            couponCode: joi.string(),
            couponDiscount: joi.number(),
            totalCost: joi.number(),
            totalSaving: joi.number()
        })
    };

    /**update cart */
    static update = {
        body: joi.object().keys({
            quantity: joi.number().integer().min(1),
            size: joi.number(),
            totalAmount: joi.number()
        })
    };

    /**apply coupon */
    static coupon = {
        body: joi.object().keys({
            couponCode: joi.string(),
            couponDiscount: joi.number(),
            totalCost: joi.number()
        })
    };
}

export default validate;
