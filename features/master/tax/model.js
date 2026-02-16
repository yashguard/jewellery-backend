import mongoose from "mongoose";

/**TAX schema */
const mongooseSchema = new mongoose.Schema({
  taxValue: { type: Number, default: 0 },
});

const TaxModel = mongoose.model("tax", mongooseSchema);
export default TaxModel;
