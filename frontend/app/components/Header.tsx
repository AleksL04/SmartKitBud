import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "./LogoutButton";

// This is a Server Component, so we can check cookies on the server.
export default async function Header() {
  // FIX: Added 'await' here. The cookies() function is asynchronous.
  const cookieStore = await cookies();
  const authToken = cookieStore.get("pb_auth")?.value;
  const isLoggedIn = !!authToken;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              MyApp
            </Link>
          </div>

          {/* Navigation Links */}
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

            {/* Conditional Login/Logout Button */}
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

