"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Particles } from "@/components/ui/particles";

export function HeroParticles() {
  const { resolvedTheme } = useTheme();
  const [color, setColor] = useState("#d97706");

  useEffect(() => {
    setColor(resolvedTheme === "dark" ? "#fbbf24" : "#92400e");
  }, [resolvedTheme]);

  return (
    <Particles
      className="absolute inset-0"
      quantity={60}
      color={color}
      ease={80}
      size={0.5}
    />
  );
}
