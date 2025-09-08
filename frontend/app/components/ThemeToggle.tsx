"use client";

import { IconButton } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeContext } from "../ThemeRegistry";
import { useTheme } from "@mui/material/styles";

export default function ThemeToggle() {
  const { toggleTheme } = useThemeContext();
  const theme = useTheme();

  return (
    <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
      {theme.palette.mode === "dark" ? (
        <Brightness7Icon />
      ) : (
        <Brightness4Icon />
      )}
    </IconButton>
  );
}