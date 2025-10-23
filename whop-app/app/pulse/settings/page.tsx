'use client';

import { useEffect, useState } from 'react';
import { Typography, Button } from '@whop/frosted-ui';
import Navbar from '@/components/Navbar';

// This page is creator-only - part of the /pulse/ dashboard routes
// In production, add proper authentication middleware to protect these routes
export default function SettingsPage() {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <Typography as="h1" variant="display-sm" className="text-white mb-3 font-bold">
            Settings
          </Typography>
          <Typography as="p" variant="body" className="text-white text-lg">
            Configure your app integrations and preferences
          </Typography>
        </div>

        <div className="space-y-6">
          {/* Whop Integration */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <Typography as="h2" variant="title-sm" className="text-white mb-2 font-semibold">
              Whop Integration
            </Typography>
            <Typography as="p" variant="body-sm" className="text-white mb-5">
              Connect your Whop account to enable advanced features
            </Typography>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5">
              <Typography as="p" variant="body-sm" className="text-white/60 italic">
                Coming soon: Authenticate with Whop to access user data and send direct messages
              </Typography>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <Typography as="h2" variant="title-sm" className="text-white mb-2 font-semibold">
              AI Insights
            </Typography>
            <Typography as="p" variant="body-sm" className="text-white mb-5">
              Get AI-powered summaries and insights from your feedback
            </Typography>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5">
              <Typography as="p" variant="body-sm" className="text-white/60 italic">
                Coming soon: Automatic feedback analysis and sentiment trends
              </Typography>
            </div>
          </div>

          {/* Weekly Reports */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <Typography as="h2" variant="title-sm" className="text-white mb-2 font-semibold">
              Weekly Reports
            </Typography>
            <Typography as="p" variant="body-sm" className="text-white mb-5">
              Receive automated weekly summaries via Whop messages
            </Typography>
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-5">
              <Typography as="p" variant="body-sm" className="text-white/60 italic">
                Coming soon: Automated weekly feedback reports delivered to your Whop inbox
              </Typography>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <Typography as="h2" variant="title-sm" className="text-white mb-2 font-semibold">
              Notification Preferences
            </Typography>
            <Typography as="p" variant="body-sm" className="text-white mb-5">
              Manage how and when you receive feedback notifications
            </Typography>
            <div className="space-y-4">
              <label className="flex items-center gap-3 opacity-50 cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <Typography as="span" variant="body" className="text-white">
                  Notify me when new feedback is received (Coming soon)
                </Typography>
              </label>
              <label className="flex items-center gap-3 opacity-50 cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <Typography as="span" variant="body" className="text-white">
                  Send weekly summary emails (Coming soon)
                </Typography>
              </label>
              <label className="flex items-center gap-3 opacity-50 cursor-not-allowed">
                <input
                  type="checkbox"
                  disabled
                  className="w-5 h-5 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <Typography as="span" variant="body" className="text-white">
                  Alert me about negative feedback (Coming soon)
                </Typography>
              </label>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
            <Typography as="h2" variant="title-sm" className="text-white mb-2 font-semibold">
              Profile Settings
            </Typography>
            <Typography as="p" variant="body-sm" className="text-white mb-5">
              Customize your feedback link and profile
            </Typography>
            <div>
              <Typography as="label" variant="body-sm" className="text-white mb-3 block font-semibold">
                Feedback Link Slug
              </Typography>
              <div className="flex gap-3 mb-3">
                <span className="flex items-center px-5 py-3 bg-white/[0.02] text-white/60 rounded-xl border border-white/[0.05] text-base">
                  {origin}/p/
                </span>
                <input
                  type="text"
                  disabled
                  defaultValue="testcreator"
                  className="flex-1 px-5 py-3 bg-white/[0.02] border border-white/[0.05] text-white rounded-xl disabled:opacity-50 text-base"
                />
              </div>
              <Typography as="p" variant="body-sm" className="text-white/60">
                Custom slugs coming soon
              </Typography>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
