# Google Sheets Integration - Quick Reference

## ✅ Implementation Complete

All components have been successfully rewritten to follow the per-user credentials pattern with variable selection.

## Files Changed (6 total)

### 1. Model
- `models/integration/googleSheet.ts` ✅
  - Per-user encrypted credentials (clientIdEncrypted, clientSecretEncrypted)
  - Variable selection array (instead of column mapping)
  - Single orderStatus trigger (instead of triggerStatuses array)

### 2. API Routes (3 files)
- `app/api/integrations/google-sheets/route.ts` ✅
  - GET: Returns account without encrypted fields
  - POST: Creates integration with encrypted credentials
  - PUT: Updates configuration
  - DELETE: Removes integration

- `app/api/integrations/google-sheets/send/route.ts` ✅
  - Decrypts credentials before use
  - Checks single orderStatus match
  - Maps only selected variables
  - Handles token refresh with re-encryption

- `app/api/integrations/google-sheets/callback/route.ts` ✅
  - Simplified redirect handler

### 3. UI Components (2 files)
- `components/dashboard/integrations/GoogleSheetsForm.tsx` ✅
  - Step 1: Credentials (clientId, clientSecret)
  - Step 2: Configuration (sheet details, variable selection, trigger status)
  - Variable checkboxes instead of column mapping
  - Single status dropdown instead of multi-select

- `app/[locale]/dashboard/integrations/google-sheets/page.tsx` ✅
  - Updated to show variable selection
  - Setup guide for per-user credentials flow
  - Connected state displays variables being sent

### 4. Integration Listing
- `app/[locale]/dashboard/integrations/page.tsx` ✅
  - Google Sheets card already added

## Environment Requirements

```bash
# Add to .env.local
ENCRYPTION_KEY=<32-byte hex string>
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # or your deployment URL
```

To generate ENCRYPTION_KEY:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## User Setup Steps

1. Visit Dashboard → Integrations → Google Sheets
2. Click "Configure Integration"
3. **Step 1:** Enter Google OAuth credentials
   - Go to https://console.cloud.google.com
   - Create OAuth 2.0 Desktop credentials
   - Paste Client ID and Secret
4. **Step 2:** Configure Sheet
   - Spreadsheet ID (from Google Sheets URL)
   - Sheet name
   - Select variables (checkboxes)
   - Select trigger status (dropdown)
   - Enable auto-send (optional)
5. Orders matching trigger status are auto-sent with selected variables only

## Available Variables

User can select any combination of:
- orderId
- customerName
- customerEmail
- customerPhone
- orderStatus
- totalAmount
- products
- shippingAddress
- createdAt
- deliveryInstructions

## Order Status Options

Single selection (not multiple):
- new
- confirmed
- shipped
- delivered
- cancelled

## Security Features

✅ Per-user Google OAuth credentials (not global env vars)
✅ AES-256-CTR encryption for all sensitive fields
✅ Encrypted fields not returned by API unless explicitly requested
✅ Token refresh handles re-encryption
✅ No plain-text credentials in database

## Testing

```bash
# Check for compilation errors
npm run build

# Test credentials encryption
curl -X POST http://localhost:3000/api/integrations/google-sheets \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_SECRET",
    "spreadsheetId": "YOUR_SPREADSHEET_ID",
    "sheetName": "Sheet1",
    "variables": ["orderId", "customerName"],
    "orderStatus": "confirmed",
    "autoSend": true
  }'

# Test data retrieval
curl http://localhost:3000/api/integrations/google-sheets
```

## Integration Trigger

The send endpoint is called automatically when:
1. Order status changes to configured trigger status
2. Auto-send is enabled
3. Integration is enabled

Manual trigger example:
```typescript
await fetch("/api/integrations/google-sheets/send", {
  method: "POST",
  body: JSON.stringify({
    orderId: order._id,
    ownerId: order.owner
  })
})
```

## Data Flow

```
Order Status Update
    ↓
Check: status === orderStatus && autoSend && enabled
    ↓
POST /api/integrations/google-sheets/send
    ↓
Fetch integration (with encrypted fields)
    ↓
Decrypt: clientId, clientSecret, spreadsheetId, sheetName, tokens
    ↓
Create OAuth2 client with user's credentials
    ↓
Refresh token if expired
    ↓
Map only selected variables to row data
    ↓
Append [variable_data] to Google Sheet
```

## Previous Session Work

### Phase 1: Dark Mode Fix ✅
- Cleaned up ThemeProvider dark class leakage
- Added unmount cleanup effects

### Phase 2: Theme 4 Related Products ✅
- Created RelatedProducts component
- Fixed React Hooks ordering issue

### Phase 3: Google Sheets Integration ✅ (This session)
- Complete rewrite from app-wide OAuth to per-user credentials
- Variable selection instead of column mapping
- Single trigger status instead of multi-status
- All sensitive data encrypted

## No Breaking Changes

- Dark mode cleanup still active
- Theme 4 features still working
- All other integrations unaffected
- Backward compatible if migrating old data

## Verification Checklist

- ✅ Model has per-user credentials
- ✅ Model has variable selection
- ✅ Model has single orderStatus
- ✅ API route encrypts credentials
- ✅ API route decrypts before use
- ✅ Send route checks single status
- ✅ Send route sends selected variables only
- ✅ Form has 2-step flow
- ✅ Form has credential input
- ✅ Form has variable checkboxes
- ✅ Form has single status dropdown
- ✅ Integration page shows variables
- ✅ No compilation errors
- ✅ Documentation complete
