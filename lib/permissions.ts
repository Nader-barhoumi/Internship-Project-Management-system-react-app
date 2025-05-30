export type UserRole = "admin" | "teacher" | "student" | "industrial_tutor"

export const permissions = {
  // Student Management Permissions
  canViewStudents: (role: UserRole): boolean => {
    return ["admin", "teacher", "industrial_tutor"].includes(role)
  },

  canCreateStudents: (role: UserRole): boolean => {
    return ["admin", "teacher"].includes(role)
  },

  canEditStudents: (role: UserRole): boolean => {
    return ["admin", "teacher"].includes(role)
  },

  canDeleteStudents: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  // Company Management Permissions
  canViewCompanies: (role: UserRole): boolean => {
    return ["admin", "teacher"].includes(role)
  },

  canCreateCompanies: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  canEditCompanies: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  canDeleteCompanies: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  // Internship Management Permissions
  canViewInternships: (role: UserRole): boolean => {
    return ["admin", "teacher", "student", "industrial_tutor"].includes(role)
  },

  canCreateInternships: (role: UserRole): boolean => {
    return ["admin", "teacher"].includes(role)
  },

  canEditInternships: (role: UserRole): boolean => {
    return ["admin", "teacher", "industrial_tutor"].includes(role)
  },

  canDeleteInternships: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  // Document Management Permissions
  canViewDocuments: (role: UserRole): boolean => {
    return ["admin", "teacher", "student", "industrial_tutor"].includes(role)
  },

  canCreateDocuments: (role: UserRole): boolean => {
    return ["admin", "teacher", "industrial_tutor"].includes(role)
  },

  canEditDocuments: (role: UserRole): boolean => {
    return ["admin", "teacher", "industrial_tutor"].includes(role)
  },

  canDeleteDocuments: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  canSignDocuments: (role: UserRole): boolean => {
    return ["admin", "teacher", "student", "industrial_tutor"].includes(role)
  },

  // Academic Staff Management Permissions
  canViewAcademicStaff: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  canCreateAcademicStaff: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  canEditAcademicStaff: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  canDeleteAcademicStaff: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  // System Administration Permissions
  canManageUsers: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  canViewSystemStats: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  canExportData: (role: UserRole): boolean => {
    return ["admin", "teacher"].includes(role)
  },

  canImportData: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  // Profile Management Permissions
  canEditOwnProfile: (role: UserRole): boolean => {
    return ["admin", "teacher", "student", "industrial_tutor"].includes(role)
  },

  canEditOtherProfiles: (role: UserRole): boolean => {
    return ["admin"].includes(role)
  },

  // Reporting Permissions
  canViewReports: (role: UserRole): boolean => {
    return ["admin", "teacher", "industrial_tutor"].includes(role)
  },

  canCreateReports: (role: UserRole): boolean => {
    return ["admin", "teacher"].includes(role)
  },

  // Evaluation Permissions
  canEvaluateStudents: (role: UserRole): boolean => {
    return ["teacher", "industrial_tutor"].includes(role)
  },

  canViewEvaluations: (role: UserRole): boolean => {
    return ["admin", "teacher", "student", "industrial_tutor"].includes(role)
  },

  // Quick Action Permissions
  canUseQuickActions: (role: UserRole): boolean => {
    return ["admin", "teacher", "industrial_tutor"].includes(role)
  },

  // Data Access Filters
  getDataScope: (role: UserRole) => {
    switch (role) {
      case "admin":
        return "all" // Can see all data
      case "teacher":
        return "department" // Can see students/internships in their department
      case "industrial_tutor":
        return "company" // Can see students/internships at their company
      case "student":
        return "self" // Can only see their own data
      default:
        return "none"
    }
  },

  // Role hierarchy check
  hasHigherPrivileges: (userRole: UserRole, targetRole: UserRole): boolean => {
    const hierarchy = {
      admin: 4,
      teacher: 3,
      industrial_tutor: 2,
      student: 1,
    }
    return hierarchy[userRole] > hierarchy[targetRole]
  },
}

// Helper function to check multiple permissions at once
export const hasAnyPermission = (role: UserRole, permissionChecks: ((role: UserRole) => boolean)[]): boolean => {
  return permissionChecks.some((check) => check(role))
}

// Helper function to check all permissions
export const hasAllPermissions = (role: UserRole, permissionChecks: ((role: UserRole) => boolean)[]): boolean => {
  return permissionChecks.every((check) => check(role))
}
