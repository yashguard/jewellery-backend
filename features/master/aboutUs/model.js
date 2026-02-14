import mongoose from "mongoose";
import {aboutUsTypeEnum,connectionTypeEnum} from "../../../config/enum.js";

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
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        media: [ {
            link: String,
            mediaType: {type: String,enum: Object.values(connectionTypeEnum),}
        } ]
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const AboutUsModel = mongoose.model("aboutUs",mongooseSchema);
export default AboutUsModel;
