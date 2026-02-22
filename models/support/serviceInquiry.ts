import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IServiceInquiry extends Document {
    fullName: string;
    phoneNumber: string;
    email: string;
    serviceType: string;
    domainOfWork?: string;
    message?: string;
    status: 'new' | 'contacted' | 'converted' | 'closed';
    createdAt: Date;
    updatedAt: Date;
}

const serviceInquirySchema = new Schema<IServiceInquiry>(
    {
        fullName: {
            type: String,
            required: [true, 'Full name is required'],
            trim: true,
            minlength: [2, 'Full name must be at least 2 characters'],
            maxlength: [100, 'Full name must not exceed 100 characters'],
        },
        phoneNumber: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        serviceType: {
            type: String,
            required: [true, 'Service type is required'],
            enum: [
                'Custom Website',
                'WordPress website',
                'Shopify Store',
                'Basic Store',
                'Store + WhatsApp Auto Reply',
                'Store + Delivery API Integration',
                'Full COD System (Automation)',
                'AI WhatsApp Agent Integration',
                'Other',
            ],
        },
        domainOfWork: {
            type: String,
            trim: true,
            maxlength: [100, 'Domain of work must not exceed 100 characters'],
        },
        message: {
            type: String,
            trim: true,
            maxlength: [1000, 'Message must not exceed 1000 characters'],
        },
        status: {
            type: String,
            enum: ['new', 'contacted', 'converted', 'closed'],
            default: 'new',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
serviceInquirySchema.index({ createdAt: -1 });
serviceInquirySchema.index({ status: 1 });
serviceInquirySchema.index({ serviceType: 1 });
serviceInquirySchema.index({ email: 1 });

const ServiceInquiry: Model<IServiceInquiry> =
    mongoose.models.ServiceInquiry ||
    mongoose.model<IServiceInquiry>('ServiceInquiry', serviceInquirySchema);

export default ServiceInquiry;
