# 🚀 Pulse App Migration Guide

## Before You Begin

### ⚠️ Important: Backup Your Database

1. Go to your Supabase project
2. Navigate to **Database** → **Backups**
3. Click **"Back up now"** or ensure you have a recent backup
4. Wait for backup to complete before proceeding

---

## Migration Steps

### Step 1: Review What's Changing

This migration adds:
- ✅ **Multi-emoji reactions** (👍 ❤️ 🔥 😱) with user tracking
- ✅ **Product categories** for messages (Main Product, Service, Feature Request, Bug Report, Other)
- ✅ **Indexes** for better performance
- ✅ **Unique constraints** to prevent duplicate reactions

### Step 2: Run the Migration

1. Open your **Supabase project**
2. Go to **SQL Editor**
3. Click **"New query"**
4. Copy the contents of `migration-all-features.sql`
5. Paste into the editor
6. Click **"Run"** or press `Cmd/Ctrl + Enter`

### Step 3: Verify Migration Success

You should see output like this:

```
===========================================
Migration completed successfully!
===========================================
Total messages: X
Total reactions: X
Total creators: X
===========================================
New features enabled:
  ✅ Multi-emoji reactions (👍 ❤️ 🔥 😱)
  ✅ User reaction tracking
  ✅ Product categories
  ✅ Hot message detection (5+ reactions)
  ✅ Time-based features (NEW badges)
===========================================
```

### Step 4: Test the Application

1. **Restart your dev server:**
   ```bash
   cd whop-app
   npm run dev
   ```

2. **Test emoji reactions:**
   - Visit `http://localhost:3000/pulse/dashboard`
   - Click on different emoji buttons
   - Verify you can add/remove reactions
   - Try adding 5+ reactions to see the 🔥 HOT badge

3. **Test product categories:**
   - Visit `http://localhost:3000/p/testcreator`
   - Submit a new message
   - Select a product category (🚀 Main Product, ⚡ Service, etc.)
   - Check that the badge appears on the message card

4. **Test NEW badges:**
   - Submit a new message
   - Verify it shows a blue "NEW" badge
   - Wait 24 hours or change your system time to test expiration

---

## Troubleshooting

### Issue: "Column already exists" error

**Solution:** The migration is safe to re-run. It uses `IF NOT EXISTS` clauses.

### Issue: "Duplicate key violation" on reactions

**Solution:** 
1. Check if you have duplicate reactions in the database:
   ```sql
   SELECT message_id, reaction_type, user_hash, COUNT(*) 
   FROM reactions 
   GROUP BY message_id, reaction_type, user_hash 
   HAVING COUNT(*) > 1;
   ```

2. If duplicates exist, clear reactions:
   ```sql
   TRUNCATE TABLE reactions RESTART IDENTITY CASCADE;
   ```

### Issue: Messages not showing product categories

**Solution:** Product categories are optional. Old messages won't have them. New messages will only show the badge if a category was selected.

### Issue: Emoji reactions not working

**Checklist:**
- [ ] Migration ran successfully?
- [ ] Dev server restarted?
- [ ] Browser cache cleared?
- [ ] Check browser console for errors
- [ ] Verify Supabase connection in `.env.development.local`

---

## Rolling Back (If Needed)

If you need to roll back the migration:

```sql
-- Remove new columns
ALTER TABLE messages DROP COLUMN IF EXISTS product_category;
ALTER TABLE reactions DROP COLUMN IF EXISTS user_hash;

-- Remove new indexes
DROP INDEX IF EXISTS idx_messages_product_category;
DROP INDEX IF EXISTS idx_reactions_user_hash;
DROP INDEX IF EXISTS idx_reactions_unique_user_emoji;

-- Reset reaction_type default
ALTER TABLE reactions ALTER COLUMN reaction_type SET DEFAULT 'thumbs_up';
```

⚠️ **Warning:** This will delete all product category data and remove user tracking from reactions.

---

## After Migration

### Recommended Actions:

1. **Test thoroughly** before deploying to production
2. **Monitor** Supabase logs for any errors
3. **Update documentation** for your team about new features
4. **Consider** enabling analytics to track feature usage

### Optional Enhancements:

- [ ] Add product category filter to dashboard (coming soon)
- [ ] Build analytics dashboard (coming soon)
- [ ] Add "This Week" stats (coming soon)
- [ ] Highlight unanswered messages > 3 days old (coming soon)

---

## Support

If you encounter issues:

1. Check the terminal logs for errors
2. Check Supabase logs in the dashboard
3. Verify all environment variables are set
4. Ensure you're using the latest code from the repository

---

**Migration Version:** 1.0.0  
**Date:** January 24, 2025  
**Compatible With:** Pulse App v2.0+

