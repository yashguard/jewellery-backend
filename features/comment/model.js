import mongoose from "mongoose";

/**PUBLIC - comment schema */
const mongooseSchema = mongoose.Schema(
    {
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "blog"
        },
        name: {
            type: String,
        },
        email: {
            type: String,
        },
        comment: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

mongooseSchema.index({blog: 1});
const CommentModel = new mongoose.model("comment",mongooseSchema);
export default CommentModel;
