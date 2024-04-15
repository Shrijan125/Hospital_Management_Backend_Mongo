import mongoose from "mongoose";

const medCategorySchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const MedCategory = mongoose.model("MedCategory", medCategorySchema);
