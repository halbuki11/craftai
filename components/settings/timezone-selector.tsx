"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TIMEZONES = [
  { value: "Europe/Istanbul", label: "Turkiye (UTC+3)" },
  { value: "Europe/London", label: "Londra (UTC+0/+1)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1/+2)" },
  { value: "Europe/Moscow", label: "Moskova (UTC+3)" },
  { value: "Asia/Baku", label: "Baku (UTC+4)" },
  { value: "Asia/Tashkent", label: "Taskent (UTC+5)" },
  { value: "Asia/Almaty", label: "Almati (UTC+6)" },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)" },
  { value: "America/New_York", label: "New York (UTC-5/-4)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8/-7)" },
  { value: "America/Chicago", label: "Chicago (UTC-6/-5)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Asia/Shanghai", label: "Sanghay (UTC+8)" },
  { value: "Australia/Sydney", label: "Sidney (UTC+10/+11)" },
  { value: "Pacific/Auckland", label: "Auckland (UTC+12/+13)" },
];

interface TimezoneSelectorProps {
  currentTimezone: string;
}

export function TimezoneSelector({ currentTimezone }: TimezoneSelectorProps) {
  const [selected, setSelected] = useState(currentTimezone);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = async (value: string) => {
    setSelected(value);
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: value }),
      });

      if (!res.ok) throw new Error();

      setSaved(true);
      toast.success("Saat dilimi guncellendi");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Saat dilimi guncellenemedi");
      setSelected(currentTimezone);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      >
        {TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>

      {saving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
      {saved && <Check className="w-4 h-4 text-green-500" />}
    </div>
  );
}
