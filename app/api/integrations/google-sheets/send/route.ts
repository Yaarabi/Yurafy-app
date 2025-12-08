import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoDB";
import GoogleSheetIntegration from "@/models/integration/googleSheet";
import Order from "@/models/store/orders";
import { google } from "googleapis";
import { decryptToken } from "@/lib/crypto";

/**
 * POST - Send selected order variables to Google Sheet
 * Called by order status webhook when status matches trigger
 */
export async function POST(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { orderId, ownerId } = body;

    if (!orderId || !ownerId) {
      return NextResponse.json(
        { message: "Order ID and Owner ID are required" },
        { status: 400 }
      );
    }

    // Fetch integration with encrypted fields
    const integration = await GoogleSheetIntegration.findOne({
      owner: ownerId,
      enabled: true,
    }).select(
      "+clientIdEncrypted +clientSecretEncrypted +spreadsheetIdEncrypted +sheetNameEncrypted +accessTokenEncrypted +refreshTokenEncrypted"
    );

    if (!integration) {
      return NextResponse.json({
        message: "No active Google Sheet integration",
      });
    }

    // Fetch the order
    const order = await Order.findOne({ _id: orderId, owner: ownerId });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if order status matches single trigger status
    if (order.status !== integration.orderStatus) {
      return NextResponse.json({
        message: `Order status '${order.status}' does not match trigger '${integration.orderStatus}'`,
      });
    }

    // Decrypt sensitive credentials
    const clientId = decryptToken(integration.clientIdEncrypted);
    const clientSecret = decryptToken(integration.clientSecretEncrypted);
    const spreadsheetId = decryptToken(integration.spreadsheetIdEncrypted);
    const sheetName = decryptToken(integration.sheetNameEncrypted);
    let accessToken = decryptToken(integration.accessTokenEncrypted);
    const refreshToken = decryptToken(integration.refreshTokenEncrypted);

    // Variable mapping for order fields
    const variableMapping: Record<string, () => any> = {
      orderId: () => order._id.toString(),
      customerName: () => order.shippingAddress?.fullName || "",
      customerEmail: () => order.shippingAddress?.email || "",
      customerPhone: () => order.shippingAddress?.phone || "",
      orderStatus: () => order.status,
      totalAmount: () => order.totalAmount || "",
      products: () =>
        order.products
          ?.map((p: any) => `${p.name} x${p.quantity}`)
          .join("; ") || "",
      shippingAddress: () => {
        const addr = order.shippingAddress;
        return [addr?.address, addr?.city, addr?.country]
          .filter(Boolean)
          .join(", ");
      },
      createdAt: () =>
        new Date(order.createdAt).toISOString().split("T")[0],
      deliveryInstructions: () => order.deliveryInstructions || "",
    };

    // Build row data with only selected variables
    const rowData: any[] = [];
    for (const variable of integration.variables) {
      const getter = variableMapping[variable];
      rowData.push(getter ? getter() : "");
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/integrations/google-sheets/callback`
    );

    // Refresh access token if needed
    if (refreshToken) {
      try {
        oauth2Client.setCredentials({
          refresh_token: refreshToken,
        });
        const { credentials } = await oauth2Client.refreshAccessToken();
        if (credentials.access_token) {
          accessToken = credentials.access_token;

          // Update encrypted token in DB
          integration.accessTokenEncrypted = credentials.access_token;
          // Optionally update refresh token if provided
          if (credentials.refresh_token) {
            integration.refreshTokenEncrypted = credentials.refresh_token;
          }
          await integration.save();
        }
      } catch (refreshError) {
        console.warn("Token refresh failed, attempting with existing token:", refreshError);
      }
    }

    // Set credentials for API call
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    // Append row to Google Sheet
    const sheets = google.sheets({
      version: "v4",
      auth: oauth2Client,
    });

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: "RAW",
      requestBody: {
        values: [rowData],
      },
    });

    return NextResponse.json({
      message: "Order data sent to Google Sheet",
      spreadsheetId,
    });
  } catch (error: any) {
    console.error("Error sending order to Google Sheet:", error);
    return NextResponse.json(
      { message: "Error sending order", error: error.message },
      { status: 500 }
    );
  }
}
