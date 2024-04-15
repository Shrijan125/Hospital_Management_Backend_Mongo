import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  booked: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    consultationCharge: {
      type: String,
      required: true,
    },
    profilePhoto: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dept",
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
    },
    LongDescription: {
      type: String,
      required: true,
    },
    availability: {
      type:[timeSlotSchema],
      required:true
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = mongoose.model("Doctor", doctorSchema);
