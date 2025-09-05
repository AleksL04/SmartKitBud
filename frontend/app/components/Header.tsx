import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  // ✅ FIX: Call cookies() directly without await
  const cookieStore = cookies();

  // ✅ FIX: Look for the correct 'session' cookie
  const sessionCookie = (await cookieStore).get("session")?.value;
  const isLoggedIn = !!sessionCookie;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              MyApp
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/upload"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              Upload
            </Link>

            {isLoggedIn ? (
              <LogoutButton />
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-shadow shadow-sm hover:shadow-md"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}