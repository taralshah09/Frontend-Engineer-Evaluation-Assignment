"use client";

import React from "react";
import { useTheme } from "./ThemeContext";
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="icon-btn"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
            {theme === "dark" ? <MdOutlineLightMode size={18} /> : <MdOutlineDarkMode size={18} />}
        </button>
    );
}
