import mongoose from "mongoose";
import {videoCallStatusEnum} from "../../config/enum.js";

/**PUBLIC - video call schema */
const mongooseSchema = new mongoose.Schema(
    {
        language: {
            type: String,
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: Object.values(videoCallStatusEnum),
            default: videoCallStatusEnum.PENDING
        },
        message: {
            type: String
        }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const VideoCallModel = mongoose.model("VideoCall",mongooseSchema);
export default VideoCallModel;
