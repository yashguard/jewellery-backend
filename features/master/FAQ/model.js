import mongoose from "mongoose";

/**ADMIN - FAQ schema */
const mongooseSchema = new mongoose.Schema(
    {
        question: {type: String},
        answer: {type: String},
        type: {type: String}
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const FaqModel = mongoose.model("faq",mongooseSchema);
export default FaqModel;
