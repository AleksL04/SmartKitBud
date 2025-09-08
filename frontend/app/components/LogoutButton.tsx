"use client";

import { useRouter } from "next/navigation";
import { Button } from "@mui/material";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  };

  return (
    <Button
      onClick={handleLogout}
      variant="contained"
      color="secondary"
      sx={{ mr: 1 }}
    >
      Logout
    </Button>
  );
}