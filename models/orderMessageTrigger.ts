import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderMessageTrigger extends Document {
    ownerId: mongoose.Types.ObjectId;
    whatsappAccountId: mongoose.Types.ObjectId;
    name: string;
    orderStatus: string;
    template: string;
    active: boolean;
    auto: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const orderMessageTriggerSchema = new Schema<IOrderMessageTrigger>(
    {
        ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner ID is required'],
        index: true,
        },
        whatsappAccountId: {
        type: Schema.Types.ObjectId,
        ref: 'WhatsAppAccount',
        required: [true, 'WhatsApp Account ID is required'],
        index: true,
        },
        name: {
        type: String,
        required: [true, 'Trigger name is required'],
        },
        orderStatus: {
        type: String,
        required: [true, 'Order status is required'],
        enum: [
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled',
            'refunded',
            'returned'
        ],
        index: true,
        },
        template: {
        type: String,
        required: [true, 'Template message is required'],
        maxlength: [1000, 'Template message cannot exceed 1000 characters'],
        },
        active: {
        type: Boolean,
        required: true,
        default: true,
        },
        auto: {
        type: Boolean,
        required: true,
        default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Compound index to ensure one trigger per owner/whatsapp account/order status combination
orderMessageTriggerSchema.index(
    { ownerId: 1, whatsappAccountId: 1, orderStatus: 1 },
    { unique: true }
);

// Index for efficient querying
orderMessageTriggerSchema.index({ ownerId: 1, active: 1 });

const OrderMessageTrigger = mongoose.models.OrderMessageTrigger || 
    mongoose.model<IOrderMessageTrigger>('OrderMessageTrigger', orderMessageTriggerSchema);

export default OrderMessageTrigger;