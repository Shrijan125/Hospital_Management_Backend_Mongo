import mongoose from "mongoose";

const appointmentSchema = mongoose.Schema(
  {
    doctorID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
    userID:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User",
    },
    timeSlot: {
      type:String,
      required:true
    },
    deptID:{type: mongoose.Schema.Types.ObjectId,
    ref:"Dept"},

    paymentStatus: {
      type: String,
      enum: ["pending", "done"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

export const Appointment = mongoose.model("Appointment", appointmentSchema);
