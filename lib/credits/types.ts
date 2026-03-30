import type { ModelId } from '@/lib/ai/model-config';

export interface CreditBalance {
  credits_remaining: number;
  credits_total: number;
  period_end: string;
  is_valid: boolean;
}

export interface CreditCheckResult {
  allowed: boolean;
  credits_remaining: number;
  credits_needed: number;
  error?: string;
}

export interface DeductionResult {
  success: boolean;
  remaining: number;
  error_message: string | null;
}

export interface UsageLogEntry {
  id: string;
  credits_used: number;
  credits_remaining_after: number;
  model: string;
  skill_id: string | null;
  action_type: string | null;
  source: string;
  created_at: string;
}
