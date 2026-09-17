export type RetryableRpcError = {
  code?: string
  message?: string
}

export const ONBOARDING_ALLOCATION_CONFLICT_MESSAGE =
  'This workspace is being created by another request. Please try again.'

export async function retrySerialization<T>(
  operation: () => Promise<{ data: T | null; error: RetryableRpcError | null }>,
  maxAttempts = 3,
): Promise<{ data: T | null; error: RetryableRpcError | null }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const result = await operation()
    if (result.error?.code !== '40001' || attempt === maxAttempts) return result
  }

  throw new Error('unreachable')
}

export function onboardingRpcStatus(error: RetryableRpcError | null): number {
  if (error?.code === '42501') return 403
  if (error?.code === '23505' || error?.code === '40001') return 409
  return 400
}
