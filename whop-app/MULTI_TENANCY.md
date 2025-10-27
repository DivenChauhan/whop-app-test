# Multi-Tenancy Implementation Guide

## Overview
Pulse is now a **multi-tenant application** designed for the Whop ecosystem. Each Whop company (creator business) that installs the app gets an isolated instance with complete data separation.

## How It Works

### 1. Company-Based Isolation
- When a creator installs Pulse on Whop, the app is installed **for their specific company**
- The `company_id` is provided via the environment variable `NEXT_PUBLIC_WHOP_COMPANY_ID`
- All data (messages, creators, replies, reactions) is filtered by this `company_id`

### 2. Database Schema
The following tables now include a `company_id` column:
- `messages` - All feedback/messages are scoped to a company
- `creators` - Creator profiles are company-specific

**Migration Script**: `supabase/migrations/add_company_id.sql`

To apply this migration:
```bash
# If using Supabase CLI
supabase db reset

# Or run the SQL manually in your Supabase dashboard
```

### 3. Authentication & Authorization

#### Auth Functions (`lib/auth.ts`)
- **`getUserAuth()`** - Verifies the user's Whop token and checks company access
  - Returns: `{ userId, user, companyId, isCreator, isAuthenticated, hasCompanyAccess }`
  - Checks if user is a member or admin of the company
  
- **`requireCreator()`** - Protects creator-only pages (dashboard, analytics, settings)
  - Throws error if user is not an admin of the company
  
- **`requireCompanyAccess()`** - Protects company member pages
  - Throws error if user doesn't have access to the company

#### Access Levels
- **Admin (Creator)**: Company owners/moderators
  - Can access dashboard, analytics, settings
  - Can reply to messages, mark as reviewed, delete
  
- **Member (Community)**: Regular company members
  - Can view the public feed
  - Can submit messages and react
  - Cannot access creator-only features

- **Public (Non-members)**: Users without company access
  - Cannot view or interact with the app
  - Will see authorization errors

### 4. API Routes Protection

All API routes now:
1. Verify the company_id from environment variables
2. Filter database queries by company_id
3. Check user authorization where appropriate

#### Protected Routes

**Creator-Only** (requires `isCreator` && `hasCompanyAccess`):
- `PATCH /api/feedback/[id]` - Update message
- `DELETE /api/feedback/[id]` - Delete message
- `POST /api/replies` - Create reply
- `PATCH /api/replies/[id]` - Update reply
- `DELETE /api/replies/[id]` - Delete reply
- `GET /api/analytics` - View analytics

**Company Member** (requires `hasCompanyAccess`):
- `GET /api/feedback` - View messages

**Public** (no auth required, but filtered by company_id):
- `POST /api/feedback` - Submit message (anonymous)
- `GET /api/feed` - View public feed
- `POST /api/reactions` - Add reaction
- `GET /api/reactions` - Get reactions
- `DELETE /api/reactions` - Remove reaction

### 5. Page-Level Protection

Pages are now split into server and client components:

**Server Components** (handle auth):
- `/pulse/dashboard/page.tsx` - Requires creator access
- `/pulse/analytics/page.tsx` - Requires creator access
- `/pulse/settings/page.tsx` - Requires creator access
- `/pulse/feed/page.tsx` - Public, but shows company-specific data

**Client Components** (render UI):
- `/pulse/dashboard/DashboardContent.tsx`
- `/pulse/analytics/AnalyticsContent.tsx`
- `/pulse/settings/SettingsContent.tsx`
- `/pulse/feed/FeedContent.tsx`

### 6. Data Isolation Testing

To test that data isolation is working:

1. **Setup**: Create test data for different companies
   ```sql
   -- Insert messages for Company A
   INSERT INTO messages (creator_id, company_id, message, tag, reviewed)
   VALUES ('creator-1', 'company-a', 'Test message A', 'feedback', false);
   
   -- Insert messages for Company B
   INSERT INTO messages (creator_id, company_id, message, tag, reviewed)
   VALUES ('creator-1', 'company-b', 'Test message B', 'feedback', false);
   ```

2. **Test**: Set `NEXT_PUBLIC_WHOP_COMPANY_ID` to `company-a` and verify:
   - Only messages from Company A are visible
   - Attempting to access Company B's data returns 404/403

3. **Switch**: Change to `company-b` and verify:
   - Only messages from Company B are visible
   - Company A's data is completely isolated

### 7. Environment Variables

Required for multi-tenancy:
```env
# Set by Whop when app is installed for a company
NEXT_PUBLIC_WHOP_COMPANY_ID=comp_xxxxx

# Required for Whop SDK
NEXT_PUBLIC_WHOP_APP_ID=app_xxxxx
WHOP_API_KEY=whop_xxxxx
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_xxxxx
```

### 8. Security Best Practices

✅ **Implemented**:
- Company ID validation on all API routes
- User authorization checks for sensitive operations
- Database queries filtered by company_id
- Row Level Security (RLS) policies enabled

⚠️ **Important**:
- Never trust client-provided company_id
- Always use `process.env.NEXT_PUBLIC_WHOP_COMPANY_ID`
- Verify user's access to company via Whop SDK

### 9. Development & Testing

In development mode:
- If no Whop token is present, the app uses the agent user
- The agent user is treated as a creator for testing
- Set all environment variables in `.env.development.local`

For testing multi-tenancy:
1. Create multiple test companies in Whop
2. Test the app with different `NEXT_PUBLIC_WHOP_COMPANY_ID` values
3. Verify complete data isolation between companies

### 10. Deployment to Whop

When you deploy to Whop:
1. Whop automatically sets `NEXT_PUBLIC_WHOP_COMPANY_ID` for each installation
2. Each company gets a separate app instance with isolated data
3. Users must be members of the company to access the app

## Migration Checklist

- [x] Add `company_id` column to database tables
- [x] Update TypeScript types
- [x] Implement company verification in auth
- [x] Update all API routes to filter by company_id
- [x] Protect creator-only pages
- [x] Update client components to use company-aware auth
- [x] Test data isolation
- [x] Document multi-tenancy implementation

## Future Enhancements

- **Company Settings**: Allow creators to customize their Pulse instance
- **Company Branding**: Support custom colors, logos per company
- **Cross-Company Analytics**: (Admin only) View aggregate stats across all Pulse installations
- **Invite-Only Companies**: Support private communities with invite codes

## Support

If you encounter issues with multi-tenancy:
1. Verify `NEXT_PUBLIC_WHOP_COMPANY_ID` is set correctly
2. Check that the user has access to the company in Whop
3. Review the auth logs in the browser console
4. Ensure database migration was applied successfully

