import mongoose, { Schema, Document } from "mongoose";

export interface IOrder {
  _id: string;
  owner: string;
  products: {
    product?: string;
    name: string;    
    quantity: number;
    price: number;
    color?: string;
    size?: string;
  }[];
  totalAmount: number;
  status: "new" | "confirmed" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    fullName: string;
    email?: string;
    phone: string;
    address: string;
    city?: string;
    country?: string;
  };
  deliveryInstructions?: string;
  preferredTime?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema(
  {
    owner: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true,
      index: true, // Index for owner queries
    },
    products: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: false },
        name: { type: String, required: true }, 
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
        color: { type: String },
        size: { type: String },
      },
    ],
    totalAmount: { 
      type: Number, 
      required: true,
      index: true, // Index for financial queries
    },
    status: {
      type: String,
      enum: ["new", "confirmed", "shipped", "delivered", "cancelled"],
      default: "new",
      index: true, // Index for status filtering
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      email: { type: String },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String },
      country: { type: String },
    },
    deliveryInstructions: { type: String },
    preferredTime: { type: String },
  },
  { timestamps: true }
);

// Compound indexes for common queries
OrderSchema.index({ owner: 1, status: 1 });
OrderSchema.index({ owner: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
