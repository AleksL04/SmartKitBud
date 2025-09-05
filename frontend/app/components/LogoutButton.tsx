"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // ✅ FIX: Specify method: 'POST' to match the API route
    await fetch("/api/logout", {
      method: "POST",
    });

    // This part is perfect
    router.push("/login");
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 transition-shadow shadow-sm hover:shadow-md"
    >
      Logout
    </button>
  );
}