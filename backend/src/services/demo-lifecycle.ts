import type { Db } from '../db/scoped'
import type { DemoWorkflowState, ProspectDemo } from '../db/types'

export class DemoLifecycleError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'DemoLifecycleError'
  }
}

export async function listDemos(db: Db, state?: DemoWorkflowState | null): Promise<ProspectDemo[]> {
  const { data, error } = await db.rpc('operator_list_demos', { p_state: state ?? null })
  if (error) throw new DemoLifecycleError('Could not load the demo queue.', error)
  return (data ?? []) as ProspectDemo[]
}

export async function updateDemoState(db: Db, demoId: string, state: DemoWorkflowState, notes?: string | null): Promise<ProspectDemo> {
  const { data, error } = await db.rpc('operator_update_demo_state', { p_demo_id: demoId, p_state: state, p_notes: notes ?? null })
  if (error || !data) throw new DemoLifecycleError('Could not update the demo state.', error)
  return data as ProspectDemo
}

export const demoLifecycle = { listDemos, updateDemoState }
