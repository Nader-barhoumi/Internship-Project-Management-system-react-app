import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { verifyToken } from "@/lib/auth"

interface RouteParams {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = params.id

    // Get company details
    const companyQuery = `
      SELECT c.*, a.address_details, a.city, a.state, a.zip_code
      FROM companies c
      LEFT JOIN address a ON c.address_id = a.id
      WHERE c.id = $1
    `
    const companies = await db.query(companyQuery, [companyId])

    if (companies.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    const company = companies[0]

    // Get industrial tutors for this company
    const tutorsQuery = `
      SELECT it.*, u.id as user_id, u.first_name, u.last_name, u.email, u.phone, u.profile_picture
      FROM industrial_tutors it
      JOIN users u ON it.user_id = u.id
      WHERE it.company_id = $1 AND u.is_active = true
    `
    const tutors = await db.query(tutorsQuery, [companyId])

    // Format tutors to include user info
    const formattedTutors = tutors.map((tutor: any) => ({
      user_id: tutor.user_id,
      company_id: tutor.company_id,
      job_title: tutor.job_title,
      user: {
        id: tutor.user_id,
        first_name: tutor.first_name,
        last_name: tutor.last_name,
        email: tutor.email,
        phone: tutor.phone,
        profile_picture: tutor.profile_picture,
      },
    }))

    // Get active internships count
    const activeInternshipsQuery = `
      SELECT COUNT(*) as count
      FROM internships
      WHERE company_id = $1 AND status = 'on_going'
    `
    const activeInternshipsResult = await db.query(activeInternshipsQuery, [companyId])
    const activeInternships = Number.parseInt(activeInternshipsResult[0]?.count || "0")

    // Get total internships count
    const totalInternshipsQuery = `
      SELECT COUNT(*) as count
      FROM internships
      WHERE company_id = $1
    `
    const totalInternshipsResult = await db.query(totalInternshipsQuery, [companyId])
    const totalInternships = Number.parseInt(totalInternshipsResult[0]?.count || "0")

    // Add tutors and stats to company object
    company.industrial_tutors = formattedTutors
    company.activeInternships = activeInternships
    company.totalInternships = totalInternships

    return NextResponse.json({
      company,
    })
  } catch (error) {
    console.error("Get company error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch company details" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user || (user.role !== "admin" && user.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = params.id
    const body = await request.json()
    const { name, legal_name, field, email, phone, website, is_active, address } = body

    // Update company in transaction
    const result = await db.transaction(async (client) => {
      // Get current company to check if address exists
      const currentCompanyQuery = `SELECT address_id FROM companies WHERE id = $1`
      const currentCompanyResult = await client.query(currentCompanyQuery, [companyId])

      if (currentCompanyResult.rows.length === 0) {
        throw new Error("Company not found")
      }

      const currentAddressId = currentCompanyResult.rows[0].address_id

      // Update or create address if provided
      let addressId = currentAddressId
      if (address) {
        if (addressId) {
          // Update existing address
          const updateAddressQuery = `
            UPDATE address
            SET address_details = $1, city = $2, state = $3, zip_code = $4
            WHERE id = $5
          `
          await client.query(updateAddressQuery, [
            address.address_details,
            address.city,
            address.state,
            address.zip_code,
            addressId,
          ])
        } else {
          // Create new address
          const createAddressQuery = `
            INSERT INTO address (address_details, city, state, zip_code)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `
          const addressResult = await client.query(createAddressQuery, [
            address.address_details,
            address.city,
            address.state,
            address.zip_code,
          ])
          addressId = addressResult.rows[0].id
        }
      }

      // Update company
      const updateCompanyQuery = `
        UPDATE companies
        SET name = $1, legal_name = $2, field = $3, address_id = $4, 
            email = $5, phone = $6, website = $7, is_active = $8
        WHERE id = $9
        RETURNING *
      `
      const companyResult = await client.query(updateCompanyQuery, [
        name,
        legal_name,
        field,
        addressId,
        email,
        phone,
        website,
        is_active !== undefined ? is_active : true,
        companyId,
      ])

      return companyResult.rows[0]
    })

    return NextResponse.json({
      success: true,
      message: "Company updated successfully",
      company: result,
    })
  } catch (error) {
    console.error("Update company error:", error)
    return NextResponse.json(
      {
        error: "Failed to update company",
        message: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = params.id

    // Check if company has active internships
    const activeInternshipsQuery = `
      SELECT COUNT(*) as count
      FROM internships
      WHERE company_id = $1 AND status = 'on_going'
    `
    const activeInternshipsResult = await db.query(activeInternshipsQuery, [companyId])
    const activeInternships = Number.parseInt(activeInternshipsResult[0]?.count || "0")

    if (activeInternships > 0) {
      return NextResponse.json({ error: "Cannot delete company with active internships" }, { status: 400 })
    }

    // Soft delete company
    const deleteCompanyQuery = `
      UPDATE companies
      SET is_active = false
      WHERE id = $1
      RETURNING id
    `
    const result = await db.query(deleteCompanyQuery, [companyId])

    if (result.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Company deleted successfully",
    })
  } catch (error) {
    console.error("Delete company error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete company",
        message: error instanceof Error ? error.message : "An error occurred",
      },
      { status: 500 },
    )
  }
}
