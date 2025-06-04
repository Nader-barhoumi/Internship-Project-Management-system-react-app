"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { authService, type User } from "@/lib/auth-service"
import { type UserRole } from "@/lib/permissions"

interface AuthContextType {
  user: User | null
  userRole: UserRole
  login: (email: string, password: string, role: string) => Promise<{ success: boolean; error?: string }>
  register: (userData: any) => Promise<{ success: boolean; error?: string }>
  updateProfile: (profileData: any) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        const storedEmail = localStorage.getItem("user_email")

        if (token && storedEmail) {
          try {
            const response = await authService.getProfile(token)
            setUser(response.user)
            setIsAuthenticated(true)
          } catch (error) {
            console.error("Failed to get profile:", error)
            // Clear invalid session
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_email")
            localStorage.removeItem("user_role")
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        // Clear any corrupted session data
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_email")
        localStorage.removeItem("user_role")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (
    email: string,
    password: string,
    role: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)

      const response = await authService.login(email, password, role)

      if (response.token && response.user) {
        // Store authentication data
        localStorage.setItem("auth_token", response.token)
        localStorage.setItem("user_email", email)
        localStorage.setItem("user_role", role)

        setUser(response.user)
        setIsAuthenticated(true)
        return { success: true }
      }

      return { success: false, error: "Invalid response from authentication service" }
    } catch (error) {
      console.error("Login error:", error)
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await authService.register(userData)

      if (response.success) {
        return { success: true }
      }

      return { success: false, error: "Registration failed" }
    } catch (error) {
      console.error("Registration error:", error)
      const errorMessage = error instanceof Error ? error.message : "Registration failed"
      return { success: false, error: errorMessage }
    } finally {
      setIsLoading(false)
    }
  }

  const updateProfile = async (profileData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        return { success: false, error: "No authentication token found" }
      }

      const response = await authService.updateProfile(profileData)

      if (response.user) {
        setUser(response.user)
        return { success: true }
      }

      return { success: false, error: "Failed to update profile" }
    } catch (error) {
      console.error("Profile update error:", error)
      const errorMessage = error instanceof Error ? error.message : "Profile update failed"
      return { success: false, error: errorMessage }
    }
  }

  const logout = () => {
    console.log("Auth context logout called")

    // Clear user state first
    setUser(null)
    setIsAuthenticated(false)

    // Clear all stored authentication data
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_email")
    localStorage.removeItem("user_role")

    console.log("Auth state cleared, user logged out")

    // Call logout service (fire and forget)
    authService.logout().catch(console.error)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userRole: user?.role || "student",
        login,
        register,
        updateProfile,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
