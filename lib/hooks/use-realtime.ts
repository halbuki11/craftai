"use client";

import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type ChangeEvent = "INSERT" | "UPDATE" | "DELETE";

interface UseRealtimeOptions {
  table: string;
  filter?: string; // e.g. "user_id=eq.abc-123"
  events?: ChangeEvent[];
  onInsert?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
  onChange?: (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => void;
}

export function useRealtime({
  table,
  filter,
  events = ["INSERT", "UPDATE", "DELETE"],
  onInsert,
  onUpdate,
  onDelete,
  onChange,
}: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const channelName = `realtime-${table}-${filter || "all"}`;
    let channel = supabase.channel(channelName);

    for (const event of events) {
      const config: Record<string, string> = {
        event,
        schema: "public",
        table,
      };
      if (filter) config.filter = filter;

      channel = channel.on(
        "postgres_changes" as "system",
        config,
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          onChange?.(payload);
          if (payload.eventType === "INSERT") onInsert?.(payload);
          if (payload.eventType === "UPDATE") onUpdate?.(payload);
          if (payload.eventType === "DELETE") onDelete?.(payload);
        }
      );
    }

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, events, onChange, onInsert, onUpdate, onDelete]);

  return channelRef;
}
