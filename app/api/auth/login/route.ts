import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { userDAO } from "@/lib/database"
import type { LoginRequest, LoginResponse } from "@/types/api"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    const { email, password, role } = body

    // Validate input
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Missing required fields", message: "Email, password, and role are required" },
        { status: 400 },
      )
    }

    // For development/demo purposes, use mock authentication if database is not available
    const isDevelopment = process.env.NODE_ENV === "development"

    if (isDevelopment) {
      // Mock users for development
      const mockUsers = {
        "admin@university.edu": {
          id: 1,
          name: "Dr. Sarah Johnson",
          role: "admin",
          department: "Computer Science",
          email: "admin@university.edu",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        "student@university.edu": {
          id: 2,
          name: "Alice Johnson",
          role: "student",
          department: "Computer Science",
          email: "student@university.edu",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        "tutor@university.edu": {
          id: 3,
          name: "Prof. Michael Brown",
          role: "teacher",
          department: "Electrical Engineering",
          email: "tutor@university.edu",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        "supervisor@company.com": {
          id: 4,
          name: "John Smith",
          role: "industrial_tutor",
          department: "Engineering",
          email: "supervisor@company.com",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      }

      const userData = mockUsers[email as keyof typeof mockUsers]
      if (userData && userData.role === role && password === "password") {
        // Generate JWT token
        const token = jwt.sign(
          {
            userId: userData.id,
            email: userData.email,
            role: userData.role,
          },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN },
        )

        const response: LoginResponse = {
          user: userData,
          token,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }

        return NextResponse.json(response)
      } else {
        return NextResponse.json(
          {
            error: "Invalid credentials",
            message: "Invalid email, password, or role. Use 'password' as password for demo.",
          },
          { status: 401 },
        )
      }
    }

    // Production database authentication
    try {
      // Find user by email
      const user = await userDAO.findByEmail(email)
      if (!user) {
        return NextResponse.json({ error: "Invalid credentials", message: "User not found" }, { status: 401 })
      }

      // Check if user is active
      if (!user.is_active) {
        return NextResponse.json(
          { error: "Account disabled", message: "Your account has been disabled" },
          { status: 401 },
        )
      }

      // Verify role matches
      if (user.role !== role) {
        return NextResponse.json(
          { error: "Invalid role", message: "Role does not match user account" },
          { status: 401 },
        )
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid credentials", message: "Invalid password" }, { status: 401 })
      }

      // Update last login
      await userDAO.update(user.id, { last_login: new Date() })

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN },
      )

      // Remove sensitive data from user object
      const { password_hash, reset_token, ...safeUser } = user

      const response: LoginResponse = {
        user: safeUser,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }

      return NextResponse.json(response)
    } catch (dbError) {
      console.error("Database error during login:", dbError)
      return NextResponse.json(
        { error: "Database error", message: "Unable to connect to database. Please try again later." },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: "An error occurred during login" },
      { status: 500 },
    )
  }
}
