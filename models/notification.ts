import mongoose, { Schema, models, model } from 'mongoose';

export interface INotification {
    _id: string;
    recipient: string; // User ID
    title: string;
    message: string;
    type: 'system' | 'support' | 'order' | 'plan' | 'admin';
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema(
    {
        recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: { type: String, enum: ['system', 'support', 'order', 'plan', 'admin'], default: 'system' },
        read: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = models.Notification || model('Notification', notificationSchema);
export default Notification;


