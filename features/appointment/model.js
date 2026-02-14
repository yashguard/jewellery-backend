import mongoose from "mongoose";
import {appointmentStatusEnum} from "../../config/enum.js";

/**PUBLIC - store appointment schema */
const mongooseSchema = new mongoose.Schema(
    {
        name: {type: String},
        email: {type: String},
        phone: {type: Number},
        date: {type: Date},
        time: {type: String},
        message: {type: String},
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        },
        status: {
            type: String,
            enum: Object.values(appointmentStatusEnum),
            default: appointmentStatusEnum.PENDING
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const AppointmentModel = mongoose.model("appointment",mongooseSchema);
export default AppointmentModel;
