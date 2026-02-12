import mongoose from "mongoose";

/**ADMIN - blog schema */
const mongooseSchema = new mongoose.Schema(
  {
    title: {type: String,unique: true},
    video: {type: String},
    url: {type: String},
    description: {type: String},
    html: {type: String},
    commentCount: {type: Number,default: 0},
    slug: {type: String,unique: true},
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const BlogModel = mongoose.model("blog",mongooseSchema);
export default BlogModel;
