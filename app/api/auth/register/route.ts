import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { userDAO, db } from "@/lib/database"
import type { RegisterRequest } from "@/types/api"

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      cin,
      role,
      student_id,
      degree,
      level,
      company_id,
      job_title,
      department,
      position,
      access_level,
    } = body

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !phone || !cin || !role) {
      return NextResponse.json(
        { error: "Missing required fields", message: "All basic fields are required" },
        { status: 400 },
      )
    }

    // Check if user already exists
    const existingUser = await userDAO.findByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: "User exists", message: "User with this email already exists" },
        { status: 409 },
      )
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create user and role-specific record in transaction
    const result = await db.transaction(async (client) => {
      // Create user
      const userQuery = `
        INSERT INTO users (first_name, last_name, cin, email, phone, password_hash, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `
      const userResult = await client.query(userQuery, [first_name, last_name, cin, email, phone, password_hash, role])
      const user = userResult.rows[0]

      // Create role-specific record
      switch (role) {
        case "student":
          if (!student_id || !degree || !level) {
            throw new Error("Student ID, degree, and level are required for student registration")
          }
          const studentQuery = `
            INSERT INTO students (user_id, student_id, degree, level)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `
          await client.query(studentQuery, [user.id, student_id, degree, level])
          break

        case "teacher":
          const teacherQuery = `
            INSERT INTO teachers (user_id, department, position)
            VALUES ($1, $2, $3)
            RETURNING *
          `
          await client.query(teacherQuery, [user.id, department, position])
          break

        case "industrial_tutor":
          if (!job_title) {
            throw new Error("Job title is required for industrial tutor registration")
          }
          const tutorQuery = `
            INSERT INTO industrial_tutors (user_id, company_id, job_title)
            VALUES ($1, $2, $3)
            RETURNING *
          `
          await client.query(tutorQuery, [user.id, company_id, job_title])
          break

        case "admin":
          const adminQuery = `
            INSERT INTO admins (user_id, position, access_level)
            VALUES ($1, $2, $3)
            RETURNING *
          `
          await client.query(adminQuery, [user.id, position || "Administrator", access_level || 1])
          break

        default:
          throw new Error("Invalid role specified")
      }

      return user
    })

    // Remove sensitive data
    const { password_hash: _, reset_token, ...safeUser } = result

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please wait for admin approval.",
      user: safeUser,
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      {
        error: "Registration failed",
        message: error instanceof Error ? error.message : "An error occurred during registration",
      },
      { status: 500 },
    )
  }
}
