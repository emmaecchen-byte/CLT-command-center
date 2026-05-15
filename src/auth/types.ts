export type UserRole = 'qc' | 'management' | 'engineer'

export interface AuthUser {
  username: string
  displayName: string
  role: UserRole
}

export interface MockAccount {
  username: string
  password: string
  displayName: string
  role: UserRole
}
