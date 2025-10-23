'use client';

import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Configure your Pulse app integrations and preferences</p>

        <div className="space-y-6">
          {/* Whop Integration Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Whop Integration
            </h2>
            <p className="text-gray-600 mb-4">
              Connect your Whop account to enable advanced features
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 italic">
                {/* TODO: Connect Whop MCP for user authentication */}
                Coming soon: Authenticate with Whop to access user data and send direct messages
              </p>
            </div>
          </div>

          {/* AI Insights Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              AI Insights
            </h2>
            <p className="text-gray-600 mb-4">
              Get AI-powered summaries and insights from your feedback
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 italic">
                {/* TODO: Add AI summary generation endpoint */}
                Coming soon: Automatic feedback analysis and sentiment trends
              </p>
            </div>
          </div>

          {/* Weekly Reports Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Weekly Reports
            </h2>
            <p className="text-gray-600 mb-4">
              Receive automated weekly summaries via Whop messages
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-500 italic">
                {/* TODO: Send weekly insights to creator */}
                Coming soon: Automated weekly feedback reports delivered to your Whop inbox
              </p>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Notification Preferences
            </h2>
            <p className="text-gray-600 mb-4">
              Manage how and when you receive feedback notifications
            </p>
            <div className="space-y-3">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 text-accent-9 border-gray-300 rounded focus:ring-accent-9 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">
                  Notify me when new feedback is received (Coming soon)
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 text-accent-9 border-gray-300 rounded focus:ring-accent-9 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">
                  Send weekly summary emails (Coming soon)
                </span>
              </label>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 text-accent-9 border-gray-300 rounded focus:ring-accent-9 disabled:opacity-50"
                />
                <span className="text-sm text-gray-700">
                  Alert me about negative feedback (Coming soon)
                </span>
              </label>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Profile Settings
            </h2>
            <p className="text-gray-600 mb-4">
              Customize your feedback link and profile
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Link Slug
                </label>
                <div className="flex gap-3">
                  <span className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg border border-gray-300">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/p/
                  </span>
                  <input
                    type="text"
                    disabled
                    defaultValue="testcreator"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:bg-gray-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Custom slugs coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

