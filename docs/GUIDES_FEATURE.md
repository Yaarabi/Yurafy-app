# Guides Feature Documentation

## Overview
The Guides feature provides a comprehensive video tutorial system where users can learn about platform features through YouTube videos. Admins can dynamically manage video content without code changes.

## Features
- ✅ **User-facing Guides Page**: Video grid with category filtering and modal player
- ✅ **Admin Management Interface**: Full CRUD operations for managing guides
- ✅ **Multi-language Support**: Translations for English, French, and Arabic
- ✅ **Category System**: Organized by topic (Overview, Products, Orders, Automation, AI Agent)
- ✅ **Responsive Design**: Mobile-friendly with adaptive layouts
- ✅ **Dark Mode Support**: Full theme integration
- ✅ **Available for All Plans**: No feature gating

## File Structure

### Database Model
- **Path**: `models/guides.ts`
- **Schema**:
  ```typescript
  {
    category: enum ['overview', 'products', 'orders', 'automation', 'ai-agent'],
    title: string (required),
    description: string (required),
    videoUrl: string (required),
    order: number (default: 0),
    isActive: boolean (default: true),
    createdAt: Date,
    updatedAt: Date
  }
  ```

### API Routes
- **Path**: `app/api/guides/route.ts`
- **Endpoints**:
  - `GET /api/guides` - Fetch guides (filtered by active status for non-admins)
  - `POST /api/guides` - Create new guide (admin only)
  - `PUT /api/guides` - Update existing guide (admin only)
  - `DELETE /api/guides?id={guideId}` - Delete guide (admin only)

### User Pages
1. **User Guides Page**
   - **Path**: `app/[locale]/dashboard/guides/page.tsx`
   - **Features**:
     - Category filter with icons (All, Overview, Products, Orders, Automation, AI Agent)
     - Video grid with YouTube thumbnails
     - Click-to-play modal with iframe embed
     - Loading and empty states
     - Responsive layout (1/2/3 columns)

2. **Admin Management Page**
   - **Path**: `app/[locale]/admin/guides/page.tsx`
   - **Features**:
     - Table view of all guides (active and inactive)
     - Add/Edit modal with form validation
     - Delete with confirmation
     - Category dropdown
     - Order number input
     - Active/Inactive toggle
     - Real-time YouTube URL preview

### Navigation
- **Component**: `components/dashboard/sidebar/SidebarNav.tsx`
- **Icon**: BookOpen from lucide-react
- **Position**: Between "Conversations" and "Settings"
- **Availability**: All plans (Starter, WhatsApp Automation, AI WhatsApp Agent, Pro Seller, Visionary, Free)

### Translations
Translation keys added to `messages/en.json`, `messages/fr.json`, `messages/ar.json`:

**User Interface** (`guides.*`):
- title, subtitle
- categories (all, overview, products, orders, automation, ai-agent)
- watchNow, close, empty
- errors.loadFailed

**Admin Interface** (`admin.guides.*`):
- title, subtitle, addNew, editGuide, createGuide, empty, confirmDelete
- edit, delete, save, saving, cancel
- table (category, title, videoUrl, order, status, actions)
- status (active, inactive)
- form (category, title, description, videoUrl, order, status, isActive)
- success (created, updated, deleted)
- errors (loadFailed, saveFailed, deleteFailed)

**Navigation** (`nav.guides`):
- en: "Guides"
- fr: "Guides"
- ar: "الأدلة"

## Usage

### For Users
1. Navigate to **Dashboard → Guides** from the sidebar
2. Browse all guides or filter by category
3. Click on a video thumbnail to watch
4. Close modal when finished

### For Admins
1. Navigate to **Admin → Guides**
2. View all existing guides in table format
3. **Add New Guide**:
   - Click "Add New Guide" button
   - Select category from dropdown
   - Enter title, description, and YouTube URL
   - Set display order (lower numbers appear first)
   - Toggle active/inactive status
   - Click "Save"
4. **Edit Guide**:
   - Click edit icon on any guide row
   - Update fields as needed
   - Click "Save"
5. **Delete Guide**:
   - Click delete icon on any guide row
   - Confirm deletion

## YouTube URL Support
The system extracts video IDs from various YouTube URL formats:
- Standard: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short: `https://youtu.be/VIDEO_ID`
- Embed: `https://www.youtube.com/embed/VIDEO_ID`

## Technical Details

### Category Icons
- **All**: Play icon
- **Overview**: BookOpen icon
- **Products**: Package icon
- **Orders**: ShoppingCart icon
- **Automation**: Zap icon
- **AI Agent**: Bot icon

### Security
- Admin routes protected by session authentication
- Role-based access control (only admins can create/edit/delete)
- Non-admin users only see active guides

### Performance
- Guides sorted by category and order number
- Indexes on category and order fields
- Lazy loading of video iframes

### Styling
- Consistent with existing dashboard theme
- Uses CSS variables (`--brand-blue`)
- Tailwind CSS for responsive design
- Framer Motion for smooth animations
- Dark mode support via `dark:` classes

## Future Enhancements (Optional)
- Video duration display
- View count tracking
- User completion tracking
- Video playlist functionality
- Search functionality
- Bulk upload/import guides
- Video thumbnail customization

## Testing Checklist
- [ ] Create guide from admin panel
- [ ] Edit existing guide
- [ ] Delete guide with confirmation
- [ ] Filter by category on user page
- [ ] Play video in modal
- [ ] Test with different YouTube URL formats
- [ ] Verify mobile responsiveness
- [ ] Check dark mode consistency
- [ ] Test i18n switching (EN/FR/AR)
- [ ] Verify access control (admin vs user)
- [ ] Test empty states
- [ ] Verify inactive guides hidden from users
