import mongoose from "mongoose";
import {aboutUsTypeEnum,mediaTypeEnum} from "../../../config/enum.js";

/**ADMIN - about us schema */
const mongooseSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: Object.values(aboutUsTypeEnum)
        },
        description: {
            type: String,
        },
        scores: [ {
            scoreTitle: {type: String},
            isProgress: {type: Boolean},
            symbol: {type: String},
            number: {type: Number}
        } ],
        url: {
            type: String
        },
        name: {
            type: String,
        },
        headTitle: {
            type: String
        },
        designation: {
            type: String,
        },
        media: [ {
            link: String,
            mediaType: {type: String,enum: Object.values(mediaTypeEnum),}
        } ]
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const AboutUsModel = mongoose.model("aboutUs",mongooseSchema);
export default AboutUsModel;
