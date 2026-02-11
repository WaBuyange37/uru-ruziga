// lib/permissions.ts
// Role-based access control for Umwero Learning Platform

export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN'

export interface Permission {
  canCreateLesson: boolean
  canEditLesson: boolean
  canDeleteLesson: boolean
  canViewAllStudents: boolean
  canManageUsers: boolean
  canDeleteAccounts: boolean
  canManageFunds: boolean
  canManageDonations: boolean
  canManageAds: boolean
  canAssignRoles: boolean
  canViewAnalytics: boolean
  canManageAchievements: boolean
  canModerateContent: boolean
}

/**
 * Get permissions based on user role
 */
export function getPermissions(role: UserRole): Permission {
  switch (role) {
    case 'ADMIN':
      return {
        canCreateLesson: true,
        canEditLesson: true,
        canDeleteLesson: true,
        canViewAllStudents: true,
        canManageUsers: true,
        canDeleteAccounts: true,
        canManageFunds: true,
        canManageDonations: true,
        canManageAds: true,
        canAssignRoles: true,
        canViewAnalytics: true,
        canManageAchievements: true,
        canModerateContent: true,
      }
    
    case 'TEACHER':
      return {
        canCreateLesson: true,
        canEditLesson: true,
        canDeleteLesson: false, // Teachers can't delete lessons
        canViewAllStudents: true,
        canManageUsers: false,
        canDeleteAccounts: false,
        canManageFunds: false,
        canManageDonations: false,
        canManageAds: false,
        canAssignRoles: false,
        canViewAnalytics: true, // Can view their students' analytics
        canManageAchievements: false,
        canModerateContent: true, // Can moderate their own content
      }
    
    case 'STUDENT':
    default:
      return {
        canCreateLesson: false,
        canEditLesson: false,
        canDeleteLesson: false,
        canViewAllStudents: false,
        canManageUsers: false,
        canDeleteAccounts: false,
        canManageFunds: false,
        canManageDonations: false,
        canManageAds: false,
        canAssignRoles: false,
        canViewAnalytics: false,
        canManageAchievements: false,
        canModerateContent: false,
      }
  }
}

/**
 * Check if user has specific permission
 */
export function hasPermission(
  role: UserRole,
  permission: keyof Permission
): boolean {
  const permissions = getPermissions(role)
  return permissions[permission]
}

/**
 * Check if user can perform action on resource
 */
export function canPerformAction(
  userRole: UserRole,
  action: 'create' | 'read' | 'update' | 'delete',
  resource: 'lesson' | 'user' | 'fund' | 'ad' | 'achievement'
): boolean {
  const permissions = getPermissions(userRole)
  
  switch (resource) {
    case 'lesson':
      if (action === 'create') return permissions.canCreateLesson
      if (action === 'update') return permissions.canEditLesson
      if (action === 'delete') return permissions.canDeleteLesson
      return true // Everyone can read lessons
    
    case 'user':
      if (action === 'delete') return permissions.canDeleteAccounts
      if (action === 'update') return permissions.canManageUsers
      return permissions.canManageUsers
    
    case 'fund':
      return permissions.canManageFunds
    
    case 'ad':
      return permissions.canManageAds
    
    case 'achievement':
      return permissions.canManageAchievements
    
    default:
      return false
  }
}

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator'
    case 'TEACHER':
      return 'Teacher'
    case 'STUDENT':
      return 'Student'
    default:
      return 'User'
  }
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return 'bg-red-100 text-red-800 border-red-300'
    case 'TEACHER':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'STUDENT':
      return 'bg-green-100 text-green-800 border-green-300'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

/**
 * Get role icon
 */
export function getRoleIcon(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '👑'
    case 'TEACHER':
      return '👨‍🏫'
    case 'STUDENT':
      return '👤'
    default:
      return '👤'
  }
}
