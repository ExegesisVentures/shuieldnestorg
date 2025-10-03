import Link from "next/link";
import { Shield } from "lucide-react";
import { createSupabaseClient } from "@/utils/supabase/server";
import HeaderUserMenu from "@/components/header-user-menu";
import HeaderSignInButton from "@/components/header-sign-in-button";

export default async function Header() {
  const client = await createSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:inline-block">
            ShieldNest
          </span>
        </Link>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/membership" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Membership
              </Link>
              <Link 
                href="/wallets" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Wallets
              </Link>
              <Link 
                href="/liquidity" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Liquidity
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/#features" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/membership" 
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                Membership
              </Link>
            </>
          )}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <HeaderUserMenu user={user} />
          ) : (
            <HeaderSignInButton />
          )}
        </div>
      </div>
    </header>
  );
}
