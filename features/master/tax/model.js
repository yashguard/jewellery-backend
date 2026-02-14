import mongoose from "mongoose";

/**TAX schema */
const mongooseSchema = new mongoose.Schema(
    {
        taxValue: Number
    }
);

const TaxModel = mongoose.model("tax",mongooseSchema);
export default TaxModel;
