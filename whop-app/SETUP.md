# 🚀 Pulse Setup Guide

## Prerequisites
- Node.js and npm installed
- Supabase account (free tier works!)
- Whop developer account

---

## Step 1: Install Dependencies

```bash
cd whop-app
npm install
```

Also install Supabase client if not already installed:
```bash
npm install @supabase/supabase-js
```

---

## Step 2: Set Up Supabase Database

### 2.1 Create a Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Choose a name (e.g., "pulse-feedback")
4. Set a database password
5. Choose a region close to you
6. Click "Create new project"

### 2.2 Run the Database Schema
1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Open the file `DATABASE_SCHEMA.md` in this project
3. Copy ALL the SQL code from that file
4. Paste it into the SQL Editor
5. Click **Run** or press `Cmd/Ctrl + Enter`
6. You should see success messages for table creation

### 2.3 Get Your API Credentials
1. In Supabase, go to **Settings** > **API** (left sidebar)
2. Copy these values:
   - **Project URL** (e.g., `https://abcdefgh.supabase.co`)
   - **anon public** key (under Project API keys)
   - **service_role** key (under Project API keys - click to reveal)

---

## Step 3: Configure Environment Variables

### 3.1 Create Local Environment File
In the `whop-app` directory, create `.env.development.local`:

```bash
# Whop Configuration (you should already have these)
WHOP_API_KEY=your_whop_api_key
NEXT_PUBLIC_WHOP_APP_ID=your_whop_app_id
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_whop_agent_user_id
NEXT_PUBLIC_WHOP_COMPANY_ID=your_whop_company_id

# Supabase Configuration (add these new ones)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

### 3.2 Replace with Your Values
- Replace `NEXT_PUBLIC_SUPABASE_URL` with your Project URL from Step 2.3
- Replace `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon public key
- Replace `SUPABASE_SERVICE_ROLE_KEY` with your service_role key

⚠️ **Important**: The `.env.development.local` file is gitignored and won't be committed to version control.

---

## Step 4: Start the Development Server

```bash
npm run dev
```

Your app should now be running at `http://localhost:3000`

---

## Step 5: Test the Application

### 5.1 Check Database Connection
1. Open `http://localhost:3000/pulse/dashboard`
2. You should see "No messages yet" (not an error!)
3. If you see errors in the console, check your Supabase credentials

### 5.2 Submit a Test Message
1. Go to `http://localhost:3000/p/testcreator`
2. Type a message
3. Select a tag (Question, Feedback, or Confession)
4. Click "Submit Message"
5. You should see a success message

### 5.3 View in Dashboard
1. Go back to `http://localhost:3000/pulse/dashboard`
2. You should see your test message
3. Try:
   - Clicking "Reply" to add a response
   - Toggling reply visibility (Public/Private)
   - Filtering by tag
   - Marking as reviewed

### 5.4 Check Public Feed
1. Go to `http://localhost:3000/pulse/feed`
2. You should see your message
3. If you made the reply public, it should appear here
4. Try clicking the "👍 React" button

---

## 🎉 Success Indicators

If everything is working, you should see:
- ✅ Dashboard loads without errors
- ✅ Can submit messages from `/p/testcreator`
- ✅ Messages appear in the dashboard
- ✅ Can reply to messages
- ✅ Can toggle reply visibility
- ✅ Public feed shows messages with public replies
- ✅ Can add reactions (thumbs up)

---

## 🐛 Troubleshooting

### Error: "TypeError: fetch failed" in console
**Solution**: Check your Supabase credentials in `.env.development.local`. Make sure:
- `NEXT_PUBLIC_SUPABASE_URL` is correct
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- You've restarted the dev server after adding env vars

### Error: "relation 'messages' does not exist"
**Solution**: You haven't run the database schema yet. Go to Step 2.2 and run the SQL from `DATABASE_SCHEMA.md`.

### Error: "Row Level Security policy violation"
**Solution**: The RLS policies might not have been created. Run the entire `DATABASE_SCHEMA.md` SQL again.

### Messages not appearing in dashboard
**Solution**: 
1. Check browser console for errors
2. Check that `CREATOR_ID` in dashboard matches the creator in database
3. Run this SQL in Supabase SQL Editor to check:
   ```sql
   SELECT * FROM creators;
   SELECT * FROM messages;
   ```

### Can't see replies in public feed
**Solution**: Make sure you toggled the reply to "Public" in the dashboard. Only public replies show in the feed.

---

## 📊 Database Management

### View All Tables
In Supabase SQL Editor, run:
```sql
SELECT * FROM creators;
SELECT * FROM messages;
SELECT * FROM replies;
SELECT * FROM reactions;
```

### Reset Database (Delete All Data)
**⚠️ Warning: This deletes all your messages and replies!**
```sql
TRUNCATE messages, replies, reactions RESTART IDENTITY CASCADE;
```

### Add a New Creator
```sql
INSERT INTO creators (name, email, feedback_link)
VALUES ('Your Name', 'your.email@example.com', 'yourcreatorslug');
```

Then update `CREATOR_ID` and `CREATOR_SLUG` in:
- `app/pulse/dashboard/page.tsx`
- `app/pulse/feed/page.tsx`

---

## 🔄 Next Steps

Once your core features are working:

1. **Connect Whop Authentication**
   - Replace hardcoded `CREATOR_ID` with real Whop user authentication
   - Use Whop MCP to get user data

2. **Add AI Insights** (Phase 2)
   - Add AI-powered message summaries
   - Weekly report generation
   - Sentiment analysis

3. **Whop Messaging Integration** (Phase 2)
   - Send messages directly to Whop DMs
   - Notification system

4. **Deploy**
   - Deploy to Vercel
   - Update Whop app settings with production URL
   - Test in Whop production environment

---

## 📝 Notes

- The current setup uses a test creator ID (`test-creator-id`)
- In production, you'll need to fetch the creator from Whop's authentication
- All message submission is anonymous (no user tracking)
- Public replies appear in the feed, private replies only in dashboard

---

## 🆘 Need Help?

1. Check the browser console for errors
2. Check the terminal/server logs for API errors
3. Review `PROGRESS.md` for implementation status
4. Check `DATABASE_SCHEMA.md` for database structure

---

**Built with ❤️ using Next.js, Supabase, and TailwindCSS**

