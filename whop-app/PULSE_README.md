# 📊 Pulse MVP - Anonymous Feedback Platform

Welcome to **Pulse**, your anonymous feedback collection platform for creators!

## 🎯 What's Been Built

This MVP includes all the core features needed to start collecting and managing anonymous feedback from your community:

### ✅ Completed Features

1. **Dashboard** (`/pulse/dashboard`)
   - View all feedback with filtering options (positive/negative/neutral)
   - Real-time metrics: total feedback, reviewed count, sentiment analysis
   - Mark feedback as reviewed
   - Delete feedback
   - Generate and copy feedback link

2. **Public Feedback Submission** (`/p/[creatorSlug]`)
   - Anonymous feedback form
   - Sentiment selection (👍 Positive, 😐 Neutral, 👎 Negative)
   - Character counter
   - Success/error handling

3. **Settings Page** (`/pulse/settings`)
   - Placeholder for future integrations (Whop MCP, AI, Weekly Reports)
   - Profile settings stub

4. **API Routes**
   - `POST /api/feedback` - Submit new feedback
   - `GET /api/feedback` - Fetch feedback with filters
   - `PATCH /api/feedback/[id]` - Update feedback (mark as reviewed)
   - `DELETE /api/feedback/[id]` - Delete feedback
   - `GET /api/creators/[feedbackLink]` - Get creator by slug

5. **Database Schema** (Supabase)
   - Creators table
   - Feedback table
   - Indexes for performance
   - Row Level Security policies

## 🚀 Quick Start

### 1. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Go to the SQL Editor and run the SQL from `DATABASE_SCHEMA.md`
3. Get your project credentials from Project Settings > API

### 2. Configure Environment Variables

Update `.env.development.local` with your Supabase credentials:

```env
# Replace these with your actual Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 3. Run the Development Server

```bash
cd whop-app
npm run dev
```

The app will be available at:
- **Dashboard**: http://localhost:3000/pulse/dashboard
- **Public Feedback**: http://localhost:3000/p/testcreator
- **Settings**: http://localhost:3000/pulse/settings

## 📁 Project Structure

```
whop-app/
├── app/
│   ├── api/
│   │   ├── feedback/
│   │   │   ├── route.ts          # Main feedback API
│   │   │   └── [id]/route.ts     # Update/delete individual feedback
│   │   └── creators/
│   │       └── [feedbackLink]/route.ts  # Get creator by slug
│   ├── pulse/
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   └── settings/page.tsx     # Settings page
│   └── p/
│       └── [creatorSlug]/page.tsx  # Public feedback form
├── components/
│   ├── FeedbackCard.tsx          # Individual feedback display
│   ├── FeedbackForm.tsx          # Feedback submission form
│   ├── MetricsCard.tsx           # Metrics display
│   └── Navbar.tsx                # Navigation
├── lib/
│   └── supabase.ts               # Supabase client & types
└── DATABASE_SCHEMA.md            # SQL schema for Supabase
```

## 🎨 Features

### Dashboard Features
- **Real-time Metrics**: Total feedback, reviewed count, sentiment percentages
- **Filtering**: Filter by sentiment (positive/neutral/negative)
- **Review Management**: Mark feedback as reviewed/unreviewed
- **Delete Functionality**: Remove feedback
- **Feedback Link Generator**: Copy your unique feedback link

### Public Feedback Form
- **Anonymous Submission**: No login required
- **Sentiment Selection**: Visual emoji-based sentiment picker
- **Character Limit**: 1000 characters with counter
- **Success Feedback**: Clear success/error messages

### API Endpoints
All endpoints are RESTful and return JSON:

```typescript
POST   /api/feedback              // Create new feedback
GET    /api/feedback?creatorId=x  // List all feedback
PATCH  /api/feedback/[id]         // Update feedback
DELETE /api/feedback/[id]         // Delete feedback
GET    /api/creators/[slug]       // Get creator by slug
```

## 🔮 Future Integrations (TODOs)

The following features are stubbed out and ready for implementation:

### 1. **Whop MCP Integration**
```typescript
// TODO: Connect Whop MCP for user authentication
// Location: app/pulse/dashboard/page.tsx
```
- Replace hardcoded `CREATOR_ID` with Whop user authentication
- Use Whop user data for creator profile
- Link feedback to Whop experiences

### 2. **AI Insights**
```typescript
// TODO: Add AI summary generation endpoint
// Location: app/pulse/settings/page.tsx
```
- Implement AI-powered feedback analysis
- Generate sentiment trends
- Create automated summaries

### 3. **Weekly Reports**
```typescript
// TODO: Send weekly insights to creator
// Location: app/pulse/dashboard/page.tsx
```
- Automated weekly feedback digests
- Sent via Whop messaging
- Customizable report frequency

## 🔧 Testing the App

### Test Data
The app comes with a test creator:
- **Creator ID**: `test-creator-id`
- **Feedback Link**: `testcreator`
- **URL**: http://localhost:3000/p/testcreator

### Testing Flow

1. **Submit Feedback**:
   - Go to http://localhost:3000/p/testcreator
   - Fill out the form and submit

2. **View Dashboard**:
   - Go to http://localhost:3000/pulse/dashboard
   - See your submitted feedback
   - Try filtering by sentiment
   - Mark feedback as reviewed

3. **Copy Feedback Link**:
   - Click "Copy Link" on the dashboard
   - Share it with others to collect feedback

## 🛠️ Customization

### Change Creator Data
Update these constants in `app/pulse/dashboard/page.tsx`:
```typescript
const CREATOR_ID = 'your-creator-id';
const CREATOR_SLUG = 'your-slug';
```

### Styling
The app uses Tailwind CSS with Whop's accent colors:
- `accent-9`: Primary action color
- `accent-10`: Hover state
- `accent-11`: Active state

### Database
Add more fields to the feedback table by:
1. Updating `lib/supabase.ts` types
2. Modifying the SQL schema
3. Updating API routes and components

## 📊 Database Schema

### Creators Table
```sql
id            UUID PRIMARY KEY
name          TEXT NOT NULL
email         TEXT UNIQUE NOT NULL
feedback_link TEXT UNIQUE NOT NULL
created_at    TIMESTAMP
```

### Feedback Table
```sql
id         UUID PRIMARY KEY
creator_id UUID REFERENCES creators(id)
message    TEXT NOT NULL
sentiment  TEXT ('up' | 'down' | 'neutral')
reviewed   BOOLEAN DEFAULT FALSE
created_at TIMESTAMP
```

## 🚀 Deployment

When you're ready to deploy:

1. **Deploy to Vercel**:
   ```bash
   npm run build
   vercel deploy
   ```

2. **Set Environment Variables** in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - All existing Whop variables

3. **Update Whop App Settings**:
   - Set your production URL in Whop dashboard
   - Update experience paths if needed

## 💡 Tips

- **Test with Multiple Users**: Open `/p/testcreator` in incognito mode to simulate different users
- **Monitor Supabase**: Use Supabase dashboard to view database directly
- **Check API Responses**: Use browser DevTools Network tab to debug API calls
- **Customize Filters**: Add more filter options in the dashboard (date ranges, keywords, etc.)

## 🐛 Troubleshooting

### "Creator not found" error
- Make sure you've run the SQL schema in Supabase
- Check that the `feedback_link` matches your slug

### Feedback not appearing
- Open browser console to check for API errors
- Verify Supabase credentials in `.env.development.local`
- Check Supabase RLS policies

### Styling issues
- Run `npm run dev` to ensure Tailwind is compiling
- Check for Tailwind class conflicts

## 📝 Next Steps

Once you're ready to enhance the MVP:

1. **Connect Whop MCP** for real user authentication
2. **Add AI Integration** for automated insights
3. **Implement Weekly Reports** via Whop messaging
4. **Add Analytics** to track feedback trends over time
5. **Custom Creator Profiles** with branding options
6. **Export Features** to download feedback as CSV/PDF
7. **Webhooks** to trigger actions on new feedback

---

**Built with**: Next.js 15, React 19, Tailwind CSS, Supabase, TypeScript

Ready to collect feedback! 🚀

