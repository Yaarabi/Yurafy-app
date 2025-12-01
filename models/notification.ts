import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    owner: mongoose.Types.ObjectId;
    type: 'support_reply' | 'order_update' | 'plan_expiry' | 'plan_warning' | 'plan_limit_reached' | 'plan_subscription' | 'welcome' | 'system' | 'admin_message';
    title: string;
    message: string;
    read: boolean;
    link?: string;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: {
            type: String,
            enum: ['support_reply', 'order_update', 'plan_expiry', 'plan_warning', 'plan_limit_reached', 'plan_subscription', 'welcome', 'system', 'admin_message'],
            required: true,
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        read: { type: Boolean, default: false, index: true },
        link: { type: String },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

// Index for efficient queries
NotificationSchema.index({ owner: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
