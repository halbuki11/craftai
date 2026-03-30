"use client";

import { useRouter } from "next/navigation";
import { useRealtime } from "@/lib/hooks/use-realtime";

interface RealtimeRefreshProps {
  table: string;
  filter?: string;
}

/**
 * Invisible component that triggers a router refresh when DB changes happen.
 * Drop this into any server-rendered page to get live updates.
 */
export function RealtimeRefresh({ table, filter }: RealtimeRefreshProps) {
  const router = useRouter();

  useRealtime({
    table,
    filter,
    onChange: () => {
      router.refresh();
    },
  });

  return null;
}
