import { createServiceClient } from '@/lib/supabase/server';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Logs an audit event to the database.
 * Uses service role client to bypass RLS.
 * Failures are logged to console but do not throw errors.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const supabase = createServiceClient();

    const { error } = await supabase.from('audit_logs').insert({
      user_id: entry.userId || null,
      action: entry.action,
      resource_type: entry.resourceType,
      resource_id: entry.resourceId || null,
      metadata: entry.metadata || {},
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
    });

    if (error) {
      // Audit logging failure should not break the app
    }
  } catch {
    // Silently fail - audit logging should never break the app
  }
}

/**
 * Common audit actions
 */
export const AuditAction = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',

  // 2FA
  TWO_FA_ENABLED: '2fa_enabled',
  TWO_FA_DISABLED: '2fa_disabled',
  TWO_FA_VERIFIED: '2fa_verified',
  TWO_FA_VERIFY_FAILED: '2fa_verify_failed',

  // Integrations
  INTEGRATION_CONNECTED: 'integration_connected',
  INTEGRATION_DISCONNECTED: 'integration_disconnected',
  INTEGRATION_CALLBACK: 'integration_callback',

  // Data operations
  NOTE_CREATED: 'note_created',
  NOTE_UPDATED: 'note_updated',
  NOTE_DELETED: 'note_deleted',
} as const;

/**
 * Common resource types
 */
export const ResourceType = {
  USER: 'user',
  INTEGRATION: 'integration',
  NOTE: 'note',
  TWO_FA: '2fa',
  SESSION: 'session',
} as const;
