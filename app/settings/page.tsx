import { Settings, User, Bell, Shield, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and security
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Profile Settings
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Update your profile information and email preferences
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled
              />
            </div>
            <Button disabled className="opacity-50 cursor-not-allowed">
              Save Changes (Coming Soon)
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
              <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Notifications
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose what updates you want to receive
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Portfolio updates
              </span>
              <input type="checkbox" disabled className="opacity-50" />
            </label>
            <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Price alerts
              </span>
              <input type="checkbox" disabled className="opacity-50" />
            </label>
            <label className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Membership updates
              </span>
              <input type="checkbox" disabled className="opacity-50" />
            </label>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Security
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your password and authentication methods
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <Button variant="outline" disabled className="w-full opacity-50 cursor-not-allowed">
              Change Password (Coming Soon)
            </Button>
            <Button variant="outline" disabled className="w-full opacity-50 cursor-not-allowed">
              Enable Two-Factor Auth (Coming Soon)
            </Button>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-xl">
              <Palette className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                Appearance
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize how ShieldNest looks for you
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white opacity-50 cursor-not-allowed"
              >
                <option>System default</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

