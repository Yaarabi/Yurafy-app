import mongoose, { Schema, Document } from 'mongoose';

export interface IGuide extends Document {
    category: 'overview' | 'products' | 'orders' | 'automation' | 'ai-agent' | 'services';
    title: string;
    description: string;
    videoUrl: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const GuideSchema = new Schema<IGuide>(
    {
        category: {
            type: String,
            enum: ['overview', 'products', 'orders', 'automation', 'ai-agent', 'services'],
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        videoUrl: {
            type: String,
            required: true,
            trim: true,
        },
        order: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
GuideSchema.index({ category: 1, order: 1 });
GuideSchema.index({ isActive: 1 });

export default mongoose.models.Guide || mongoose.model<IGuide>('Guide', GuideSchema);
