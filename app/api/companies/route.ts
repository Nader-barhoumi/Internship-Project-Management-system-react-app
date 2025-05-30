import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/auth"
import type { CompanyListResponse } from "@/types/api"

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
    const industry = searchParams.get("industry") || ""
    const status = searchParams.get("status") || ""

    const offset = (page - 1) * limit

    // Build query
    let query = `
      SELECT c.*, a.address_details, a.city, a.state, a.zip_code
      FROM companies c
      LEFT JOIN address a ON c.address_id = a.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.legal_name ILIKE $${paramIndex} OR c.field ILIKE $${paramIndex})`
      params.push(`%${search}%`)
      paramIndex++
    }

    if (industry) {
      query += ` AND c.field = $${paramIndex}`
      params.push(industry)
      paramIndex++
    }

    if (status) {
      query += ` AND c.is_active = $${paramIndex}`
      params.push(status === "active")
      paramIndex++
    }

    // Add order and pagination
    query += ` ORDER BY c.name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    // Execute query
    const companies = await db.query(query, params)

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total
      FROM companies c
      WHERE 1=1
    `
    const countParams: any[] = []
    paramIndex = 1

    if (search) {
      countQuery += ` AND (c.name ILIKE $${paramIndex} OR c.legal_name ILIKE $${paramIndex} OR c.field ILIKE $${paramIndex})`
      countParams.push(`%${search}%`)
      paramIndex++
    }

    if (industry) {
      countQuery += ` AND c.field = $${paramIndex}`
      countParams.push(industry)
      paramIndex++
    }

    if (status) {
      countQuery += ` AND c.is_active = $${paramIndex}`
      countParams.push(status === "active")
    }

    const countResult = await db.query(countQuery, countParams)
    const total = Number.parseInt(countResult[0]?.total || "0")

    // For each company, get industrial tutors
    for (const company of companies) {
      const tutorsQuery = `
        SELECT it.*, u.first_name, u.last_name, u.email, u.phone
        FROM industrial_tutors it
        JOIN users u ON it.user_id = u.id
        WHERE it.company_id = $1 AND u.is_active = true
      `
      company.industrial_tutors = await db.query(tutorsQuery, [company.id])
    }

    const response: CompanyListResponse = {
      companies,
      total,
      page,
      limit,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Get companies error:", error)
    return NextResponse.json({ error: "Internal server error", message: "Failed to fetch companies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user || (user.role !== "admin" && user.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, legal_name, field, email, phone, website, address } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 })
    }

    // Create company in transaction
    const result = await db.transaction(async (client) => {
      let addressId = null

      // Create address if provided
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
        addressId = addressResult.rows[0].id
      }

      // Create company
      const companyQuery = `
        INSERT INTO companies (name, legal_name, field, address_id, email, phone, website, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        RETURNING *
      `
      const companyResult = await client.query(companyQuery, [
        name,
        legal_name,
        field,
        addressId,
        email,
        phone,
        website,
      ])

      return companyResult.rows[0]
    })

    return NextResponse.json({
      success: true,
      message: "Company created successfully",
      company: result,
    })
  } catch (error) {
    console.error("Create company error:", error)
    return NextResponse.json(
      {
        error: "Failed to create company",
        message: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    )
  }
}
