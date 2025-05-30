import { type NextRequest, NextResponse } from "next/server"
import { internshipDAO, db } from "@/lib/database"
import { verifyToken } from "@/lib/auth"
import type { InternshipCreateRequest, InternshipListResponse } from "@/types/api"

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
    const status = searchParams.get("status") || ""
    const student_id = searchParams.get("student_id") || ""
    const company_id = searchParams.get("company_id") || ""
    const internship_type = searchParams.get("internship_type") || ""

    const offset = (page - 1) * limit

    // Build filters based on user role
    const filters: any = {
      limit,
      offset,
      status,
      internship_type,
    }

    // Role-based filtering
    if (user.role === "student") {
      filters.student_id = user.id
    } else if (student_id) {
      filters.student_id = student_id
    }

    if (company_id) {
      filters.company_id = company_id
    }

    // Get internships
    const internships = await internshipDAO.findAll(filters)

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM internships i
      JOIN students s ON i.student_id = s.user_id
      JOIN users u1 ON s.user_id = u1.id
      WHERE u1.is_active = true
      ${status ? "AND i.status = $1" : ""}
      ${filters.student_id ? `AND i.student_id = $${status ? 2 : 1}` : ""}
    `

    const countParams = []
    if (status) countParams.push(status)
    if (filters.student_id) countParams.push(filters.student_id)

    const countResult = await db.query(countQuery, countParams)
    const total = Number.parseInt(countResult[0]?.total || "0")

    const response: InternshipListResponse = {
      internships,
      total,
      page,
      limit,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get internships error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch internships" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user || (user.role !== "admin" && user.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: InternshipCreateRequest = await request.json()
    const {
      student_id,
      company_id,
      industrial_tutor_id,
      academic_work_id,
      internship_type,
      start_date,
      end_date,
      specifications,
    } = body

    // Validate required fields
    if (!student_id || !company_id || !industrial_tutor_id || !start_date || !end_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create internship in transaction
    const result = await db.transaction(async (client) => {
      // Create specifications if provided
      let specifications_id = null
      if (specifications) {
        const specQuery = `
          INSERT INTO specifications (title, objectives, main_tasks, student_profile)
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `
        const specResult = await client.query(specQuery, [
          specifications.title,
          specifications.objectives,
          specifications.main_tasks,
          specifications.student_profile,
        ])
        specifications_id = specResult.rows[0].id
      }

      // Create a placeholder signature for company (to be signed later)
      const signatureQuery = `
        INSERT INTO signature_objects (signature_type, signer_name)
        VALUES ('digital', 'Company Signature')
        RETURNING id
      `
      const signatureResult = await client.query(signatureQuery)
      const company_signature_id = signatureResult.rows[0].id

      // Create internship
      const internshipQuery = `
        INSERT INTO internships (
          student_id, academic_work_id, company_id, industrial_tutor_id,
          internship_type, start_date, end_date, company_signature
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `
      const internshipResult = await client.query(internshipQuery, [
        student_id,
        academic_work_id,
        company_id,
        industrial_tutor_id,
        internship_type || "required",
        start_date,
        end_date,
        company_signature_id,
      ])

      return internshipResult.rows[0]
    })

    return NextResponse.json({
      success: true,
      message: "Internship created successfully",
      internship: result,
    })
  } catch (error) {
    console.error("Create internship error:", error)
    return NextResponse.json(
      {
        error: "Failed to create internship",
        message: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    )
  }
}
