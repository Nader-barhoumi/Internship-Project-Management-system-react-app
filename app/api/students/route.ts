import { type NextRequest, NextResponse } from "next/server"
import { studentDAO, db } from "@/lib/database"
import { verifyToken } from "@/lib/auth"
import type { StudentCreateRequest, StudentListResponse } from "@/types/api"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const level = searchParams.get("level") || ""
    const degree = searchParams.get("degree") || ""

    const offset = (page - 1) * limit

    // Build filters
    const filters = {
      search,
      level,
      degree,
      limit,
      offset,
    }

    // Get students
    const students = await studentDAO.findAll(filters)

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM students s
      JOIN users u ON s.user_id = u.id
      WHERE u.is_active = true
      ${search ? "AND (u.first_name ILIKE $1 OR u.last_name ILIKE $1 OR s.student_id ILIKE $1)" : ""}
      ${level ? `AND s.level = $${search ? 2 : 1}` : ""}
      ${degree ? `AND s.degree = $${search && level ? 3 : search || level ? 2 : 1}` : ""}
    `

    const countParams = []
    if (search) countParams.push(`%${search}%`)
    if (level) countParams.push(level)
    if (degree) countParams.push(degree)

    const countResult = await db.query(countQuery, countParams)
    const total = Number.parseInt(countResult[0]?.total || "0")

    const response: StudentListResponse = {
      students,
      total,
      page,
      limit,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get students error:", error)
    return NextResponse.json({ error: "Internal server error", message: "Failed to fetch students" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const user = await verifyToken(request)
    if (!user || (user.role !== "admin" && user.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: StudentCreateRequest = await request.json()
    const { first_name, last_name, email, phone, cin, student_id, degree, level, sex, address } = body

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !cin || !student_id || !degree || !level) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create student in transaction
    const result = await db.transaction(async (client) => {
      // Create address if provided
      let address_id = null
      if (address) {
        const addressQuery = `
          INSERT INTO address (address_details, city, state, zip_code)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `
        const addressResult = await client.query(addressQuery, [
          address.address_details,
          address.city,
          address.state,
          address.zip_code,
        ])
        address_id = addressResult.rows[0].id
      }

      // Create user
      const userQuery = `
        INSERT INTO users (first_name, last_name, cin, email, phone, role, address_id)
        VALUES ($1, $2, $3, $4, $5, 'student', $6)
        RETURNING *
      `
      const userResult = await client.query(userQuery, [first_name, last_name, cin, email, phone, address_id])
      const newUser = userResult.rows[0]

      // Create student record
      const studentQuery = `
        INSERT INTO students (user_id, sex, student_id, degree, level)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `
      const studentResult = await client.query(studentQuery, [newUser.id, sex, student_id, degree, level])

      return {
        ...studentResult.rows[0],
        user: newUser,
      }
    })

    return NextResponse.json({
      success: true,
      message: "Student created successfully",
      student: result,
    })
  } catch (error) {
    console.error("Create student error:", error)
    return NextResponse.json(
      {
        error: "Failed to create student",
        message: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    )
  }
}
