"use client"

import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/lib/permissions"
import type { ReactNode } from "react"

interface RoleBasedWrapperProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallback?: ReactNode
  className?: string
}

export default function RoleBasedWrapper({
  children,
  allowedRoles,
  fallback = null,
  className,
}: RoleBasedWrapperProps) {
  const { userRole } = useAuth()

  // If user role is not set or not in allowed roles, show fallback or nothing
  if (!userRole || !allowedRoles.includes(userRole as UserRole)) {
    return <>{fallback}</>
  }

  // If className is provided, wrap in a div with that class
  if (className) {
    return <div className={className}>{children}</div>
  }

  return <>{children}</>
}

// Alternative component for permission-based rendering
interface PermissionWrapperProps {
  children: ReactNode
  permission: (role: UserRole) => boolean
  fallback?: ReactNode
  className?: string
}

export function PermissionWrapper({ children, permission, fallback = null, className }: PermissionWrapperProps) {
  const { userRole } = useAuth()

  // If user role is not set or permission check fails, show fallback or nothing
  if (!userRole || !permission(userRole as UserRole)) {
    return <>{fallback}</>
  }

  // If className is provided, wrap in a div with that class
  if (className) {
    return <div className={className}>{children}</div>
  }

  return <>{children}</>
}

// Hook for checking permissions in components
export function usePermissions() {
  const { userRole } = useAuth()

  const checkPermission = (permission: (role: UserRole) => boolean): boolean => {
    if (!userRole) return false
    return permission(userRole as UserRole)
  }

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!userRole) return false
    return allowedRoles.includes(userRole as UserRole)
  }

  return {
    checkPermission,
    hasRole,
    userRole: userRole as UserRole,
  }
}
