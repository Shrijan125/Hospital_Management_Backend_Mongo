import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "medCategory",
    },
    mfg: {
      type: Date,
      required: true,
    },
    exp: {
      type: Date,
      required: true,
    },
    medImage: {
      type: String,
      required: true,
    },
    prescReq: {
      type: Boolean,
      default: false,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    price: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Medicine = mongoose.model("Medicine", medicineSchema);
