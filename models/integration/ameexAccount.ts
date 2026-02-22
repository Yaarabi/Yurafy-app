import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IAmeexAccount extends Document {
    owner: mongoose.Types.ObjectId;
    apiIdEncrypted: string;
    apiKeyEncrypted: string;
    businessId?: string;
    orderStatus?: string; // optional mapping for order status to send
    autoSend?: boolean; // whether to auto-send orders to Ameex
    enabled?: boolean;
    token: string; // webhook token
    createdAt: Date;
    updatedAt: Date;
}

const ameexSchema = new Schema<IAmeexAccount>(
    {
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        apiIdEncrypted: { type: String, required: true },
        apiKeyEncrypted: { type: String, required: true },
        businessId: { type: String },
        orderStatus: { type: String, default: 'new' },
        autoSend: { type: Boolean, default: false },
        enabled: { type: Boolean, default: true },
        token: {
            type: String,
            required: true,
            unique: true,
            default: () => crypto.randomBytes(4).toString('hex'), // 8 hex chars
        },
    },
    { timestamps: true }
);

export default mongoose.models.AmeexAccount || mongoose.model<IAmeexAccount>('AmeexAccount', ameexSchema);
