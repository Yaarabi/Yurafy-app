import { Schema, model, models } from 'mongoose'

export interface ISupportAgentNote {
    guestName?: string
    contact?: string
    note: string
    createdAt?: Date
}

export interface ISupportAgent {
    prompt: string
    notes: ISupportAgentNote[]
    updatedAt?: Date
}

const SupportAgentNoteSchema = new Schema(
    {
        guestName: { type: String },
        contact: { type: String },
        note: { type: String, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)

const SupportAgentSchema = new Schema(
    {
        prompt: { type: String, default: 'You are the support agent of yurafy for web development services. Be helpful and concise.' },
        notes: { type: [SupportAgentNoteSchema], default: [] },
    },
    { timestamps: true }
)

const SupportAgent = models.SupportAgent || model('SupportAgent', SupportAgentSchema)
export default SupportAgent
