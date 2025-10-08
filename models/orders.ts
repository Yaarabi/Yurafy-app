
import mongoose, { Schema, Document } from "mongoose";

export interface IOrder  {
  _id: string;
  owner: mongoose.Types.ObjectId; 
  products: {
    product: mongoose.Types.ObjectId; 
    quantity: number;
    price: number; 
  }[];
  totalAmount: number; 
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  customer: {
    fullName: string;
    email: string;
    phone?: string;
    address: string;
    city: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true }, 
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String },
      address: { type: String, required: true },
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
