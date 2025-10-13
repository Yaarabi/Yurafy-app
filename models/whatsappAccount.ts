import mongoose, { Schema } from "mongoose";

export interface IWhatsAppAccount {
    owner: string;
    waBusinessId: string;       // WhatsApp Business Account ID (WABA ID)
    waNumberId: string;         // WhatsApp Phone Number ID  
    waNumber: string;           // e.g. "+212612345678"
    waTokenEncrypted: string;   // store encrypted, not hashed
    verified: boolean;
    botEnabled: boolean;
    botTemplate: string;
    createdAt: Date;
    updatedAt: Date;
}

const WhatsAppAccountSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        waBusinessId: { type: String, required: true, unique: true }, // WABA ID
        waNumberId: { type: String, required: true, unique: true },   // Phone Number ID
        waNumber: { type: String, required: true },                   // Raw phone number (+212...)
        waTokenEncrypted: { type: String, required: true },
        verified: { type: Boolean, default: false },
        botEnabled: { type: Boolean, default: false },
        botTemplate: { type: String, default: "" },
    },
    { timestamps: true }
);

export default mongoose.models.WhatsAppAccount ||
    mongoose.model("WhatsAppAccount", WhatsAppAccountSchema);
