static paymentCapture = async (req,res) => {
    try {
        const {razorpayOrderId,paymentId,signature,status} = req.body;

        if (razorpayOrderId && paymentId) {
            const signatureToMatch = CryptoJS.HmacSHA256(
                `${ razorpayOrderId }|${ paymentId }`,
                config.razorpay.key_secret
            ).toString();

            if (signatureToMatch === signature) {
                const existingPayment = await PaymentModel.findOne({razorpayOrderId: razorpayOrderId});
                if (existingPayment && existingPayment.razorpayOrderId) {
                    const existingOrder = await OrderModel.findById(existingPayment.orderId).populate('items.product items.variant');
                    await OrderModel.findByIdAndUpdate(existingOrder.id,{$set: {isPaid: true}},{new: true});

                    if (existingOrder) {
                        for (const item of existingOrder.items) {
                            let updatedProduct,updatedVariant;

                            if (item.product && item.product._id) {
                                updatedProduct = await ProductModel.findByIdAndUpdate(item.product._id,{
                                    $inc: {
                                        quantity: -item.quantity,
                                        sales: item.quantity
                                    }
                                },{new: true});

                                const name = updatedProduct.name;
                                const quantity = updatedProduct.quantity;
                                const sku = updatedProduct.sku;

                                if (updatedProduct.quantity < 10) {
                                    await sendMail({
                                        to: updatedProduct.createdBy,
                                        subject: `Low stock alert: ${ updatedProduct.name }`,
                                        dynamicData: {name,quantity,sku},
                                        filename: "lowStock.html",
                                    });
                                }

                                if (updatedProduct.quantity < 1) {
                                    await ProductModel.findByIdAndUpdate(item.product._id,{
                                        availability: false
                                    },{new: true});
                                }
                            }

                            if (item.variant && item.variant._id) {
                                updatedVariant = await ProductVariantModel.findByIdAndUpdate(item.variant._id,{
                                    $inc: {
                                        quantity: -item.quantity,
                                        sales: item.quantity
                                    }
                                },{new: true});

                                if (updatedVariant.quantity < 10) {
                                    await sendMail({
                                        to: updatedVariant,
                                        subject: `Low stock alert: ${ updatedVariant.name }`,
                                        dynamicData: {
                                            variant: updatedVariant,
                                        },
                                        filename: "lowStock.html",
                                    });
                                }

                                if (updatedProduct.quantity < 1) {
                                    await ProductVariantModel.findByIdAndUpdate(item.variant._id,{
                                        availability: false
                                    },{new: true});
                                }
                            }
                        }
                        await CartModel.findByIdAndDelete(existingOrder.cart);
                    }
                }

                await PaymentModel.findOneAndUpdate({razorpayOrderId},{$set: {status: "completed",paymentId}},{new: true});
                return successResponse({
                    res,
                    statusCode: 201,
                    message: "Payment successfully captured.",
                    data: {
                        razorpayOrderId,
                        paymentId,
                    },
                });
            } else {
                await PaymentModel.findOneAndUpdate({razorpayOrderId},{$set: {status: paymentStatusEnum.CANCELLED}},{new: true});
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: Error("Payment failed. Please try again.")
                });
            }
        } else if (razorpayOrderId && !paymentId) {
            await PaymentModel.findOneAndUpdate({razorpayOrderId},{$set: {status: paymentStatusEnum.FAILED}},{new: true});
            return errorResponse({
                res,
                statusCode: 400,
                error: Error("Payment failed. Please try again.")
            });
        }

    } catch (error) {
        return errorResponse({
            res,
            error,
            funName: "paymentCapture",
            message: error.message,
        });
    }
};
