# Google Sheets Integration - Complete Implementation

## Overview
Per-user OAuth credentials-based Google Sheets integration following the Ameex delivery pattern. Each user provides their own Google Client ID/Secret, which are encrypted and stored. Orders are sent with selected variables only when status matches the configured trigger.

## Architecture

### 1. Per-User Credentials Model
**File:** `models/integration/googleSheet.ts`

```typescript
// Encrypted fields for each user's Google OAuth app
- clientIdEncrypted: string (user's Google Client ID)
- clientSecretEncrypted: string (user's Google Client Secret)
- spreadsheetIdEncrypted: string
- sheetNameEncrypted: string
- accessTokenEncrypted: string (OAuth access token)
- refreshTokenEncrypted: string (OAuth refresh token)

// Configuration
- variables: string[] // Selected order fields ['orderId', 'customerName', etc]
- orderStatus: string // Single trigger status (e.g., 'confirmed')
- autoSend: boolean
- enabled: boolean
- token: string // Webhook identifier
```

**Key Design Decisions:**
- Each user owns their Google OAuth credentials
- Credentials encrypted before DB storage using AES-256-CTR
- All encrypted fields have `select: false` for security
- Single `orderStatus` trigger instead of array
- Variable selection instead of column mapping

### 2. API Routes

#### Main Route: `/api/integrations/google-sheets/route.ts`
**Operations:** GET, POST, PUT, DELETE

**GET - Fetch user's integration**
```
Returns account without encrypted fields
```

**POST - Create new integration**
```
Input: clientId, clientSecret, spreadsheetId, sheetName, variables, 
       orderStatus, autoSend, enabled
- Encrypts all sensitive data
- Creates new GoogleSheetIntegration
- Generates webhook token
```

**PUT - Update integration**
```
Input: Any configuration fields
- Re-encrypts updated sensitive fields
- Maintains existing tokens if not changed
```

**DELETE - Remove integration**
```
Soft delete or hard delete per implementation
```

#### Send Route: `/api/integrations/google-sheets/send/route.ts`
**Operation:** POST

**Flow:**
1. Fetch integration with encrypted fields
2. Check order status matches single `orderStatus` trigger
3. Decrypt credentials: clientId, clientSecret, spreadsheetId, sheetName, tokens
4. Create OAuth2 client with user's credentials
5. Refresh access token if expired (re-encrypt if updated)
6. Map selected variables only to row data
7. Append row to Google Sheet

**Variable Mapping Dictionary:**
```typescript
{
  orderId: () => order._id.toString(),
  customerName: () => order.shippingAddress?.fullName || "",
  customerEmail: () => order.shippingAddress?.email || "",
  customerPhone: () => order.shippingAddress?.phone || "",
  orderStatus: () => order.status,
  totalAmount: () => order.totalAmount || "",
  products: () => [...].join("; "),
  shippingAddress: () => [...].join(", "),
  createdAt: () => ISO date string,
  deliveryInstructions: () => order.deliveryInstructions || ""
}
```

#### Callback Route: `/api/integrations/google-sheets/callback/route.ts`
**Operation:** GET

Simple redirect handler for OAuth callback. Since credentials are provided directly via form, this primarily serves as the OAuth redirect URI that Google requires.

### 3. UI Components

#### GoogleSheetsForm Component
**File:** `components/dashboard/integrations/GoogleSheetsForm.tsx`

**Two-step flow:**

**Step 1: Credentials Entry**
- Client ID input
- Client Secret input (password field)
- Instructions for obtaining OAuth credentials
- "Continue" button

**Step 2: Configuration**
- Spreadsheet ID
- Sheet Name
- **Variables Selection** (checkboxes)
  - Select which order fields to send
  - Includes 10 available variables
- **Trigger Status** (single dropdown)
  - new, confirmed, shipped, delivered, cancelled
- **Auto Send** toggle
- **Enabled** toggle

#### Integration Page
**File:** `app/[locale]/dashboard/integrations/google-sheets/page.tsx`

**Not Connected State:**
- Setup guide with 4 steps
- Feature list
- "Configure Integration" button

**Connected State:**
- Green success banner showing:
  - Spreadsheet ID
  - Sheet Name
  - Trigger Status
  - Variables being sent
- "Edit Configuration" button
- "Disconnect" button

### 4. Security Implementation

**Encryption/Decryption:**
```typescript
// From lib/crypto.ts
import crypto from "crypto";

function encryptToken(token: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-ctr",
    Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(token, "utf8"),
    cipher.final(),
  ]);
  return iv.concat(encrypted).toString("hex");
}

function decryptToken(encrypted: string): string {
  const buffer = Buffer.from(encrypted, "hex");
  const iv = buffer.slice(0, 16);
  const decipher = crypto.createDecipheriv(
    "aes-256-ctr",
    Buffer.from(process.env.ENCRYPTION_KEY!, "hex"),
    iv
  );
  return (
    decipher.update(buffer.slice(16), undefined, "utf8") +
    decipher.final("utf8")
  );
}
```

**Required Environment Variables:**
```
ENCRYPTION_KEY=<32-byte hex string for AES-256-CTR>
NEXT_PUBLIC_BASE_URL=<deployment URL>
```

### 5. Webhook Integration

The send route would typically be called from order status webhook:

```typescript
// From order status update endpoint
if (order.status === triggerStatus && autoSend) {
  await fetch(`/api/integrations/google-sheets/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: order._id,
      ownerId: order.owner,
    }),
  });
}
```

## User Flow

1. **Navigate to Dashboard → Integrations → Google Sheets**
2. **Click "Configure Integration"**
3. **Step 1: Enter Google OAuth Credentials**
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Enter Client ID and Secret
4. **Step 2: Configure Sheet**
   - Enter Spreadsheet ID (from URL)
   - Enter Sheet Name
   - Select which variables to send (checkboxes)
   - Select trigger status (dropdown)
   - Enable auto-send (optional)
   - Click "Create"
5. **Integration Active**
   - Orders matching trigger status automatically sent
   - Selected variables only
   - All rows appended to sheet

## Data Flow

```
Order Status Update
    ↓
Check if autoSend enabled + status matches trigger
    ↓
Call /api/integrations/google-sheets/send
    ↓
Fetch integration with encrypted fields
    ↓
Decrypt credentials
    ↓
Create OAuth2 client
    ↓
Refresh token if needed
    ↓
Map selected variables to row data
    ↓
Append to Google Sheet
```

## Differences from Ameex Pattern

| Aspect | Ameex | Google Sheets |
|--------|-------|---------------|
| Credentials | Global env vars | Per-user Google OAuth |
| Configuration | Delivery address, cost | Spreadsheet ID, sheet name |
| Trigger | Single status match | Single status match ✓ |
| Data Selection | Full order object | Variable selection ✓ |
| Encryption | Yes (tokens) | Yes (credentials + tokens) ✓ |
| Multi-trigger | Yes | No (single status) ✓ |

## Testing Checklist

- [ ] Environment variable `ENCRYPTION_KEY` set
- [ ] Credentials encryption working (client secret hidden)
- [ ] API POST endpoint creates integration
- [ ] API GET endpoint returns non-encrypted fields
- [ ] API PUT endpoint updates variables/status
- [ ] Send route decrypts credentials
- [ ] Send route checks single status match
- [ ] Send route sends only selected variables
- [ ] Token refresh works and re-encrypts
- [ ] UI Step 1 credentials validation
- [ ] UI Step 2 shows variable checkboxes
- [ ] UI shows connected status with details
- [ ] Mobile responsive design

## Files Modified/Created

### Models
- ✅ `models/integration/googleSheet.ts` - **Rewritten** with per-user credentials

### API Routes
- ✅ `app/api/integrations/google-sheets/route.ts` - **Rewritten** with encryption
- ✅ `app/api/integrations/google-sheets/send/route.ts` - **Rewritten** with variable selection
- ✅ `app/api/integrations/google-sheets/callback/route.ts` - **Simplified** redirect only

### Components
- ✅ `components/dashboard/integrations/GoogleSheetsForm.tsx` - **Redesigned** 2-step form
- ✅ `app/[locale]/dashboard/integrations/google-sheets/page.tsx` - **Updated** UI

### Integration Listing
- ✅ `app/[locale]/dashboard/integrations/page.tsx` - Card added

## Dependencies
- `googleapis@105` - Google Sheets API v4
- `next-auth` - Session management
- `mongoose` - Database
- `crypto` - Built-in Node.js module

## No Breaking Changes
- Dark mode cleanup still in place
- Theme 4 Related Products section still working
- All other integrations (Ameex, Shopify, etc.) unaffected
