import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import WhatsAppAccount from "@/models/whatsappAccount";
import crypto from "crypto";

function encryptToken(token: string) {
    const cipher = crypto.createCipheriv(
        "aes-256-ctr",
        Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
        Buffer.from(process.env.ENCRYPTION_IV!, "hex")
    );
    return Buffer.concat([cipher.update(token), cipher.final()]).toString("hex");
}

// GET account
export async function GET(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const account = await WhatsAppAccount.findOne({ owner: session.user.id });
    if (!account) return NextResponse.json({ error: "No account found" }, { status: 404 });

    return NextResponse.json({ account });
    }

    // POST create/update
export async function POST(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { waBusinessId, waNumberId, waNumber, waToken } = await req.json();
        if (!waBusinessId || !waNumber || !waToken) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const waTokenEncrypted = encryptToken(waToken);

        let account = await WhatsAppAccount.findOne({ owner: session.user.id });
        if (account) {
        account.waBusinessId = waBusinessId;
        account.waNumberId = waNumberId;
        account.waNumber = waNumber;
        account.waTokenEncrypted = waTokenEncrypted;
        await account.save();
        } else {
        account = await WhatsAppAccount.create({
            owner: session.user.id,
            waBusinessId,
            waNumberId,
            waNumber,
            waTokenEncrypted,
            verified: false,
        });
        }

        return NextResponse.json({ success: true, account });
    } catch (err) {
        console.error("Error saving WhatsApp account:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// export async function POST(req: NextRequest) {
//     await connectDB();

//     try {
//         const { owner, waBusinessId, waNumber, waToken } = await req.json();
//         if (!owner || !waBusinessId || !waNumber || !waToken) {
//         return NextResponse.json({ error: "Missing fields" }, { status: 400 });
//         }

//         const waTokenEncrypted = encryptToken(waToken);

        

//         let account = await WhatsAppAccount.findOne({ owner: owner });
//         if (account) {
//         account.waBusinessId = waBusinessId;
//         account.waNumber = waNumber;
//         account.waTokenEncrypted = waTokenEncrypted;
//         await account.save();
//         } else {
//         account = await WhatsAppAccount.create({
//             owner: owner,
//             waBusinessId,
//             waNumber,
//             waTokenEncrypted,
//             verified: false,
//         });
//         }

//         return NextResponse.json({ success: true, account });
//     } catch (err) {
//         console.error("Error saving WhatsApp account:", err);
//         return NextResponse.json({ error: "Server error" }, { status: 500 });
//     }
// }


// -------------------
// PATCH verification
export async function PATCH(req: NextRequest) {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { verified } = await req.json();
        const account = await WhatsAppAccount.findOneAndUpdate(
        { owner: session.user.id },
        { $set: { verified } },
        { new: true }
        );
        if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

        return NextResponse.json({ success: true, account });
    } catch (err) {
        console.error("Error updating WhatsApp account:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
