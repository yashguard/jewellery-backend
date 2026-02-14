import mongoose from "mongoose";

/**Home page - schema */
const mongooseSchema = new mongoose.Schema({
    type: String,
    files: [ {
        range: String,
        title: String,
        urls: String,
        redirectUrl: String,
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category"
        },
        subCategory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subcategory"
        },
        giftTitle: String
    } ]
});

const HomeModel = mongoose.model("home",mongooseSchema);
export default HomeModel;
