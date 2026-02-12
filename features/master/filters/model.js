import mongoose from "mongoose";

/**Filter - schema */
const mongooseSchema = new mongoose.Schema(
    {
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category"
        },
        title: {
            type: String
        },
        filters: [
            {
                displayName: {
                    type: String
                },
                query: {
                    type: String
                },
                type: {
                    type: String
                }
            }
        ]
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const FilterModel = mongoose.model("filters",mongooseSchema);
export default FilterModel;
