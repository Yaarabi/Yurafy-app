import { NextResponse } from "next/server";

/**
 * GET - OAuth2 callback redirect URI for Google Sheets OAuth
 * Note: With per-user credentials, this is primarily used as a redirect URI
 * that Google requires but tokens are handled directly in the form/API
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/integrations/google-sheets?error=oauth_denied`
      );
    }

    // If code is present, redirect to integration page with success
    if (code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/integrations/google-sheets?success=true`
      );
    }

    // Default redirect
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/integrations/google-sheets`
    );
  } catch (error: any) {
    console.error("Error in Google Sheets callback:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/dashboard/integrations?error=callback_error`
    );
  }
}
