import crypto from "crypto";

/**
 * Encrypt WhatsApp message text
 */
export function encryptMessage(text: string): string {
    if (!text) return "";
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
        "aes-256-ctr",
        Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
        iv
    );
    
    const encrypted = Buffer.concat([
        cipher.update(text),
        cipher.final()
    ]);
    
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

/**
 * Decrypt WhatsApp message text
 */
export function decryptMessage(encrypted: string): string {
    if (!encrypted) return "";
    
    try {
        const [ivHex, encryptedText] = encrypted.split(":");
        if (!ivHex || !encryptedText) {
            // If not in encrypted format, return as-is (backward compatibility)
            return encrypted;
        }
        
        const iv = Buffer.from(ivHex, "hex");
        const decipher = crypto.createDecipheriv(
            "aes-256-ctr",
            Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
            iv
        );
        
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(encryptedText, "hex")),
            decipher.final()
        ]).toString();
        
        return decrypted;
    } catch (err) {
        console.error("Error decrypting message:", err);
        // Return original if decryption fails (backward compatibility)
        return encrypted;
    }
}

