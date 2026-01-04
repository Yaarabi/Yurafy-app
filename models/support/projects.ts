import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    name: string;
    link: string;
    img: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        name: { type: String, required: true, trim: true },
        link: { type: String, required: true, trim: true },
        img: { type: String, required: true, trim: true },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

// Index for sorting
ProjectSchema.index({ order: 1 });
ProjectSchema.index({ isActive: 1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
