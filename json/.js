const products =
{
    name: "Levis Jean",
    subcategory: [
        {
            type: "slimline",
            model: [
                {
                    type: "twill",
                    color: [
                        {
                            name: "red",
                            image: "red.jpg",
                        },
                        {
                            name: "white",
                            image: "white.jpg",
                        },
                    ],
                    size: [
                        {
                            val: 32,
                            price: "1000",
                        },
                        {
                            val: 24,
                            price: "1244",
                        },
                    ],
                },
                {
                    type: "denim",
                    colour: [
                        {
                            name: "red",
                            image: "red.jpg",
                        },
                        {
                            name: "white",
                            image: "white.jpg",
                        },
                    ],
                    size: [
                        {
                            val: 32,
                            price: 1000,
                        },
                        {
                            val: 24,
                            price: 1244,
                        },
                    ],
                },
            ],
        },
        {
            type: "superslim",
            model: [
                {
                    type: "denim",
                    colour: [
                        {
                            name: "red",
                            image: "red.jpg",
                        },
                        {
                            name: "white",
                            image: "white.jpg",
                        },
                    ],
                    size: [
                        {
                            val: 32,
                            price: 1000,
                        },
                        {
                            val: 24,
                            price: 1244,
                        },
                    ],
                },
                {
                    type: "dobby",
                    colour: [
                        {
                            name: "red",
                            image: "red.jpg",
                        },
                        {
                            name: "white",
                            image: "white.jpg",
                        },
                    ],
                    size: [
                        {
                            val: 32,
                            price: 1000,
                        },
                        {
                            val: 24,
                            price: 1244,
                        },
                    ],
                },
            ],
        },
    ],
    category: "2AM",
    image: "/images/2AM/DSCF4739-5.jpg",
};



import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
    {
        name: {type: String,required: true,unique: true},
        category: {type: String,required: true},
        subcategory: [
            {
                type: String,
                model: [
                    {
                        type: String,
                        color: [
                            {
                                name: String,
                                image: String,
                            },
                        ],
                        size: [
                            {
                                val: Number,
                                price: Number,
                            },
                        ],
                    },
                ],
            },
        ],
        image: {type: String,required: true},
    },
    {timestamps: true},
    {versionKey: false},
    {strict: false}
);
const Product = mongoose.model("Product",productSchema);

export default Product;



router.post('/products',upload.single('image'),async (req,res) => {
    try {
        // Validate request body
        if (!req.body.name || !req.body.description || !req.body.variants) {
            return res.status(400).json({message: 'Missing required fields'});
        }

        // Upload image to DigitalOcean Spaces (replace with your uploadFile function)
        const imageUrl = await uploadFile({
            filename: `product-images/${ req.file.filename }`,
            file: req.file.buffer, // Assuming req.file.buffer contains the image data
            ACL: "public-read",
        });

        if (!imageUrl) {
            return res.status(500).json({message: 'Image upload failed'});
        }

        // Calculate total price, discount, and saved amount for each variant
        const variants = req.body.variants.map((variant) => {
            const {metalPrices,diamondQualityPrice} = variant;
            const price = metalPrices.base + diamondQualityPrice;
            const discount = metalPrices.discount || 0;
            const savedAmount = discount > 0 ? discount : 0;
            const grandTotal = price - savedAmount;

            return {
                ...variant, // Include all original variant properties
                price,
                discount,
                savedAmount,
                grandTotal,
            };
        });

        // Create new product with image URL, variants with calculated prices
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            image: imageUrl,
            variants,
            // Add other product properties as needed
        });

        await product.save();

        res.status(201).json({message: 'Product created successfully',product});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error creating product'});
    }
});

const mongoose from 'mongoose');
const Schema = mongoose.Schema;

const productSchemas = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    shortDescription: {
        type: String,
        trim: true
    },
    categories: [ {
        type: Schema.Types.ObjectId,
        ref: 'Category' // Reference to your Category model
    } ],
    brand: {
        type: String,
        trim: true
    },
    metal: {
        type: String,
        trim: true
    }, // Metal type (e.g., yellow gold, white gold, platinum)
    diamondQuality: {
        type: String,
        trim: true
    }, // Diamond quality grade (e.g., F, G, H, etc.)
    diamondCarat: {
        type: Number,
        min: 0
    }, // Diamond carat weight
    settingType: {
        type: String,
        trim: true
    }, // Setting type (e.g., prong, bezel, etc.)
    length: {
        type: String,
        trim: true
    }, // Necklace length (if applicable)
    chainStyle: {
        type: String,
        trim: true
    }, // Chain style (if applicable)
    images: [ String ], // Array of image URLs or paths
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    withDiscountPrice: {
        type: Number,
        default: 0
    }, // Calculated field to store discounted price
    tax: { // Tax information (optional)
        type: Schema.Types.ObjectId,
        ref: 'Tax' // Reference to your Tax model (if applicable)
    },
    inStock: {
        type: Boolean,
        default: true
    },
    totalStockQty: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    }, // Average customer rating for the product (optional)
    totalReviews: {
        type: Number,
        default: 0
    }, // Total number of customer reviews for the product (optional)
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Product',productSchema);




if (discount && existingVariant.discount) {
    for (const item of discount) {
        for (const existingItem of existingVariant.discount) {
            if (item.discountAppliesOn === existingItem.discountAppliesOn) {
                return errorResponse({
                    res,
                    statusCode: 400,
                    error: new Error(`Discount is already applied on ${ item.discountAppliesOn }.`)
                });
            }
        }
    }
}
