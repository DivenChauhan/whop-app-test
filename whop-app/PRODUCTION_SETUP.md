# Production Setup Guide

## Environment Variables

For production deployment, ensure these environment variables are set:

### Required Variables
```bash
# Whop Company ID - Set by Whop when the app is installed
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id_here

# Whop API Configuration
WHOP_API_KEY=your_whop_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### Development Variables (Optional)
```bash
# Only set these in development environments
ENABLE_DEV_FALLBACK=true
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_test_user_id_here
```

## Key Changes for Production

### 1. Dynamic Creator ID
- ✅ **Fixed**: Creator ID is now dynamically determined from the company
- ✅ **Fixed**: No more hardcoded creator IDs in pages
- ✅ **Fixed**: Creator is automatically created for new companies

### 2. Development Fallbacks Disabled
- ✅ **Fixed**: Development fallbacks only work when `ENABLE_DEV_FALLBACK=true`
- ✅ **Fixed**: Production environments will not have fallback authentication
- ✅ **Fixed**: Proper error handling for unauthenticated users

### 3. Multi-Tenancy
- ✅ **Verified**: All data is properly isolated by company_id
- ✅ **Verified**: Authentication checks company access
- ✅ **Verified**: API routes filter by company_id

## Deployment Checklist

1. **Set Environment Variables**
   - Configure all required environment variables
   - Ensure `ENABLE_DEV_FALLBACK` is NOT set in production

2. **Database Setup**
   - Run the migration: `supabase/migrations/add_company_id.sql`
   - Verify RLS policies are enabled

3. **Test Authentication**
   - Verify Whop authentication works
   - Test creator vs member access levels
   - Ensure company isolation works

4. **Verify Creator Creation**
   - Test that creators are automatically created for new companies
   - Verify feedback links work correctly

## Security Notes

- Development fallbacks are completely disabled in production
- All authentication goes through Whop's official SDK
- Company data is isolated at the database level
- No cross-company data leakage possible
