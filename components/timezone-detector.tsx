"use client";

import { useEffect } from "react";

export function TimezoneDetector() {
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!tz) return;

    // Save to profile if not already set
    fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: tz, autoDetect: true }),
    }).catch(() => {});
  }, []);

  return null;
}
