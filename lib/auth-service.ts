// Client-side authentication service that works without API calls

export interface User {
  id: number
  name: string
  email: string
  role: "admin" | "student" | "teacher" | "industrial_tutor"
  department?: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface AuthResponse {
  user: User
  token: string
  expires_at: Date
}

class AuthService {
  private mockUsers: Record<string, User> = {
    "admin@university.edu": {
      id: 1,
      name: "Dr. Sarah Johnson",
      email: "admin@university.edu",
      role: "admin",
      department: "Computer Science",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    "student@university.edu": {
      id: 2,
      name: "Alice Johnson",
      email: "student@university.edu",
      role: "student",
      department: "Computer Science",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    "tutor@university.edu": {
      id: 3,
      name: "Prof. Michael Brown",
      email: "tutor@university.edu",
      role: "teacher",
      department: "Electrical Engineering",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    "supervisor@company.com": {
      id: 4,
      name: "John Smith",
      email: "supervisor@company.com",
      role: "industrial_tutor",
      department: "Engineering",
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  }

  async login(email: string, password: string, role: string): Promise<AuthResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = this.mockUsers[email]

    if (!user) {
      throw new Error("User not found")
    }

    if (user.role !== role) {
      throw new Error("Role does not match user account")
    }

    if (password !== "password") {
      throw new Error("Invalid password. Use 'password' for demo accounts.")
    }

    if (!user.is_active) {
      throw new Error("Account is disabled")
    }

    // Generate mock token
    const token = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    const response: AuthResponse = {
      user,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }

    return response
  }

  async register(userData: any): Promise<{ success: boolean }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // In a real app, this would create a new user
    console.log("Registration data:", userData)

    return { success: true }
  }

  async getProfile(token: string): Promise<{ user: User }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Extract user info from stored data
    const storedEmail = localStorage.getItem("user_email")
    const storedRole = localStorage.getItem("user_role")

    if (!storedEmail || !storedRole) {
      throw new Error("No user session found")
    }

    const user = this.mockUsers[storedEmail]
    if (!user) {
      throw new Error("User not found")
    }

    return { user }
  }

  async updateProfile(profileData: any): Promise<{ user: User }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    const storedEmail = localStorage.getItem("user_email")
    if (!storedEmail) {
      throw new Error("No user session found")
    }

    const user = this.mockUsers[storedEmail]
    if (!user) {
      throw new Error("User not found")
    }

    // Update user data
    const updatedUser = { ...user, ...profileData }
    this.mockUsers[storedEmail] = updatedUser

    return { user: updatedUser }
  }

  async logout(): Promise<{ success: boolean }> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    return { success: true }
  }
}

export const authService = new AuthService()
