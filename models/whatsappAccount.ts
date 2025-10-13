import mongoose, { Schema } from "mongoose";

export interface IWhatsAppAccount {
    owner: string;
    waBusinessId: string;
    waNumber: string;
    waTokenEncrypted: string; // store encrypted, not hashed
    verified: boolean;
    botEnabled: boolean;
    botTemplate: string;
    createdAt: Date;
    updatedAt: Date;
}

const WhatsAppAccountSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
        waBusinessId: { type: String, required: true, unique: true },
        waNumber: { type: String, required: true },
        waTokenEncrypted: { type: String, required: true },
        verified: { type: Boolean, default: false },
        botEnabled: { type: Boolean, default: false },
        botTemplate: { type: String, default: "" },

    },
    { timestamps: true }
);

export default mongoose.models.WhatsAppAccount || mongoose.model("WhatsAppAccount", WhatsAppAccountSchema);
