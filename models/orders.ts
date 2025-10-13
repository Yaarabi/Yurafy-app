
import mongoose, { Schema, Document } from "mongoose";

export interface IOrder {
  _id: string;
  owner: string; 
  products: {
    product: string;
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    fullName: string;
    email?: string;
    phone: string;
    address: string;
    city?: string;
    country?: string;
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
        color: { type: String, required: false },
        size: { type: String, required: false },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String, required: false },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: false },
      country: { type: String, required: false },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);




                        