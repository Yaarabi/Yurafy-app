import mongoose, { Schema, Document } from "mongoose";
import crypto from "crypto";

export interface IGoogleSheetIntegration extends Document {
  owner: mongoose.Types.ObjectId;
  
  // User's Google OAuth credentials (encrypted)
  clientIdEncrypted: string; // Each user's Google Client ID
  clientSecretEncrypted: string; // Each user's Google Client Secret
  
  // Google Sheets connection
  spreadsheetIdEncrypted: string; // Encrypted spreadsheet ID
  sheetNameEncrypted: string; // Encrypted sheet name
  accessTokenEncrypted: string; // Encrypted OAuth access token
  refreshTokenEncrypted?: string; // Encrypted refresh token
  tokenExpiry?: Date; // When access token expires
  
  // Order data to send (variables user selects)
  variables: string[]; // Selected order fields to send: ['orderId', 'customerName', 'totalAmount', etc.]
  
  // Trigger settings
  orderStatus?: string; // Which order status triggers sending (e.g., 'confirmed')
  autoSend?: boolean; // Whether to auto-send orders
  enabled?: boolean; // Whether this integration is active
  
  token: string; // Webhook token for identification
  createdAt?: Date;
  updatedAt?: Date;
}

const GoogleSheetSchema = new Schema<IGoogleSheetIntegration>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clientIdEncrypted: {
      type: String,
      required: true,
      select: false, // Don't return by default for security
    },
    clientSecretEncrypted: {
      type: String,
      required: true,
      select: false,
    },
    spreadsheetIdEncrypted: {
      type: String,
      required: true,
      select: false,
    },
    sheetNameEncrypted: {
      type: String,
      required: true,
      select: false,
    },
    accessTokenEncrypted: {
      type: String,
      required: true,
      select: false,
    },
    refreshTokenEncrypted: {
      type: String,
      select: false,
    },
    tokenExpiry: {
      type: Date,
    },
    variables: {
      type: [String],
      enum: [
        "orderId",
        "customerName",
        "customerEmail",
        "customerPhone",
        "orderStatus",
        "totalAmount",
        "products",
        "shippingAddress",
        "createdAt",
        "deliveryInstructions",
      ],
      default: ["orderId", "customerName", "totalAmount"],
    },
    orderStatus: {
      type: String,
      enum: ["new", "confirmed", "shipped", "delivered", "cancelled"],
      default: "confirmed",
    },
    autoSend: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      default: () => crypto.randomBytes(4).toString("hex"), // 8 hex chars
    },
  },
  { timestamps: true }
);

// Index for finding integration by owner and enabled status
GoogleSheetSchema.index({ owner: 1, enabled: 1 });

export default mongoose.models.GoogleSheetIntegration ||
  mongoose.model<IGoogleSheetIntegration>("GoogleSheetIntegration", GoogleSheetSchema);
