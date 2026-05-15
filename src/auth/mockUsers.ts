import type { MockAccount } from './types'

/** Demo only — replace with real auth in production. */
export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    username: 'qc',
    password: 'qc123',
    displayName: 'Jordan Lee (QC)',
    role: 'qc',
  },
  {
    username: 'manager',
    password: 'mgmt123',
    displayName: 'Alex Rivera (Management)',
    role: 'management',
  },
  {
    username: 'engineer',
    password: 'eng123',
    displayName: 'Taylor Kim (Engineering)',
    role: 'engineer',
  },
]
