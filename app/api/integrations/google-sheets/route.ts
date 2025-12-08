import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { connectDB } from "@/lib/db/mongoDB";
import GoogleSheetIntegration from "@/models/integration/googleSheet";
import { encryptToken, decryptToken } from "@/lib/crypto";

// GET - Retrieve user's Google Sheet integration
export async function GET(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const account = await GoogleSheetIntegration.findOne({
      owner: session.user.id,
    });
    if (!account)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Don't return encrypted fields
    const obj = account.toObject ? account.toObject() : JSON.parse(JSON.stringify(account));
    delete obj.clientIdEncrypted;
    delete obj.clientSecretEncrypted;
    delete obj.spreadsheetIdEncrypted;
    delete obj.sheetNameEncrypted;
    delete obj.accessTokenEncrypted;
    delete obj.refreshTokenEncrypted;

    return NextResponse.json({ account: obj });
  } catch (err: any) {
    console.error("Error fetching Google Sheet account:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

// POST - Create Google Sheet integration
export async function POST(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const payload = await req.json();
    const {
      clientId,
      clientSecret,
      spreadsheetId,
      sheetName,
      accessToken,
      refreshToken,
      tokenExpiry,
      variables,
      orderStatus,
      autoSend,
      enabled,
    } = payload || {};

    if (!clientId || !clientSecret)
      return NextResponse.json(
        { error: "clientId and clientSecret are required" },
        { status: 400 }
      );
    if (!spreadsheetId)
      return NextResponse.json(
        { error: "spreadsheetId is required" },
        { status: 400 }
      );
    if (!accessToken)
      return NextResponse.json(
        { error: "accessToken is required" },
        { status: 400 }
      );

    const clientIdEncrypted = encryptToken(String(clientId));
    const clientSecretEncrypted = encryptToken(String(clientSecret));
    const spreadsheetIdEncrypted = encryptToken(String(spreadsheetId));
    const sheetNameEncrypted = encryptToken(String(sheetName || "Orders"));
    const accessTokenEncrypted = encryptToken(String(accessToken));
    const refreshTokenEncrypted = refreshToken
      ? encryptToken(String(refreshToken))
      : undefined;

    let account = await GoogleSheetIntegration.findOne({
      owner: session.user.id,
    });

    if (account) {
      account.clientIdEncrypted = clientIdEncrypted;
      account.clientSecretEncrypted = clientSecretEncrypted;
      account.spreadsheetIdEncrypted = spreadsheetIdEncrypted;
      account.sheetNameEncrypted = sheetNameEncrypted;
      account.accessTokenEncrypted = accessTokenEncrypted;
      if (refreshTokenEncrypted) account.refreshTokenEncrypted = refreshTokenEncrypted;
      if (tokenExpiry) account.tokenExpiry = new Date(tokenExpiry);
      if (variables) account.variables = variables;
      if (orderStatus) account.orderStatus = orderStatus;
      if (typeof autoSend === "boolean") account.autoSend = autoSend;
      if (typeof enabled === "boolean") account.enabled = enabled;
      await account.save();
    } else {
      account = await GoogleSheetIntegration.create({
        owner: session.user.id,
        clientIdEncrypted,
        clientSecretEncrypted,
        spreadsheetIdEncrypted,
        sheetNameEncrypted,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        tokenExpiry: tokenExpiry ? new Date(tokenExpiry) : undefined,
        variables: variables || ["orderId", "customerName", "totalAmount"],
        orderStatus: orderStatus || "confirmed",
        autoSend: !!autoSend,
        enabled: enabled !== false,
      });
    }

    const obj = account.toObject ? account.toObject() : JSON.parse(JSON.stringify(account));
    delete obj.clientIdEncrypted;
    delete obj.clientSecretEncrypted;
    delete obj.spreadsheetIdEncrypted;
    delete obj.sheetNameEncrypted;
    delete obj.accessTokenEncrypted;
    delete obj.refreshTokenEncrypted;

    return NextResponse.json({ success: true, account: obj });
  } catch (err: any) {
    console.error("Error saving Google Sheet account:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

// PUT - Update Google Sheet integration settings
export async function PUT(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const updates = await req.json();
    if (!updates || typeof updates !== "object")
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const account = await GoogleSheetIntegration.findOne({
      owner: session.user.id,
    });
    if (!account)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (typeof updates.clientId === "string" && updates.clientId.trim())
      account.clientIdEncrypted = encryptToken(updates.clientId.trim());
    if (typeof updates.clientSecret === "string" && updates.clientSecret.trim())
      account.clientSecretEncrypted = encryptToken(updates.clientSecret.trim());
    if (typeof updates.spreadsheetId === "string" && updates.spreadsheetId.trim())
      account.spreadsheetIdEncrypted = encryptToken(updates.spreadsheetId.trim());
    if (typeof updates.sheetName === "string")
      account.sheetNameEncrypted = encryptToken(updates.sheetName || "Orders");
    if (updates.variables && Array.isArray(updates.variables))
      account.variables = updates.variables;
    if (typeof updates.orderStatus === "string")
      account.orderStatus = updates.orderStatus;
    if (typeof updates.autoSend === "boolean") account.autoSend = updates.autoSend;
    if (typeof updates.enabled === "boolean") account.enabled = updates.enabled;

    await account.save();

    const obj = account.toObject ? account.toObject() : JSON.parse(JSON.stringify(account));
    delete obj.clientIdEncrypted;
    delete obj.clientSecretEncrypted;
    delete obj.spreadsheetIdEncrypted;
    delete obj.sheetNameEncrypted;
    delete obj.accessTokenEncrypted;
    delete obj.refreshTokenEncrypted;

    return NextResponse.json({ success: true, account: obj });
  } catch (err: any) {
    console.error("Error updating Google Sheet account:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove Google Sheet integration
export async function DELETE(req: NextRequest) {
  await connectDB();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const deleted = await GoogleSheetIntegration.findOneAndDelete({
      owner: session.user.id,
    });
    if (!deleted)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting Google Sheet account:", err);
    return NextResponse.json(
      { error: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
