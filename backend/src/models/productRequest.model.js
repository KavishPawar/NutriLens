import mongoose from "mongoose";

const productRequestSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "cleared"],
      default: "pending",
    },
    requestedBy: {
      userId: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        default: "",
      },
      email: {
        type: String,
        default: "",
      },
    },
  },
  { timestamps: true },
);

const productRequestModel = mongoose.model("product_requests", productRequestSchema);

export default productRequestModel;
