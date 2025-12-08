
import { Schema, model, models } from 'mongoose';

export interface ISupportMessage {
    owner: string; 
    role: 'user' | 'bot';
    text: string;
    createdAt?: Date;
}

const SupportMessageSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: String, enum: ['user', 'bot'], required: true },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

const SupportMessage = models.SupportMessage || model('SupportMessage', SupportMessageSchema);
export default SupportMessage;
