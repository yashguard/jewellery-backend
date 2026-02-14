import mongoose from "mongoose";
import {blogTypeEnum} from "../../../config/enum.js";

/**ADMIN - blog schema */
const mongooseSchema = new mongoose.Schema(
  {
    title: {type: String},
    video: {type: String},
    url: {type: String},
    description: {type: String},
    html: {type: String},
    commentCount: {type: Number,default: 0},
    slug: {type: String},
    postBy: {type: mongoose.Schema.Types.ObjectId,ref: "user"},
    type: {type: String,enum: Object.values(blogTypeEnum)}
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const BlogModel = mongoose.model("blog",mongooseSchema);
export default BlogModel;
