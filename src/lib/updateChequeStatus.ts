import { supabase } from './supabase'
import type { ChequeStatus, UpdateChequeStatusOptions } from '@/types'

/**
 * Change a cheque's status via the change_cheque_status database function,
 * which validates the transition, updates the cheque, and writes the history
 * row in a single transaction.
 */
export async function updateChequeStatus(
  chequeId: string,
  newStatus: ChequeStatus,
  options: UpdateChequeStatusOptions
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.rpc('change_cheque_status', {
    p_cheque_id: chequeId,
    p_new_status: newStatus,
    p_changed_by: options.changedBy,
    p_note: options.note ?? null,
    p_return_reason: newStatus === 'RETURNED' ? options.returnReason ?? null : null,
  })

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}

/**
 * Record a bank deposit and mark the allocated cheques DEPOSITED in one
 * transaction — either all of it is saved or none of it is.
 */
export async function recordDeposit(
  amount: number,
  depositDate: string,
  chequeIds: string[],
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.rpc('record_deposit', {
    p_amount: amount,
    p_deposit_date: depositDate,
    p_cheque_ids: chequeIds,
    p_notes: notes ?? null,
  })

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true }
}
