import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database"
import type { DashboardStats } from "@/types/api"

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get dashboard statistics
    const stats = await getDashboardStats(user.role, user.id)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json(
      { error: "Internal server error", message: "Failed to fetch dashboard stats" },
      { status: 500 },
    )
  }
}

async function getDashboardStats(userRole: string, userId: number): Promise<DashboardStats> {
  const baseQuery = userRole === "student" ? "WHERE s.user_id = $1" : ""
  const params = userRole === "student" ? [userId] : []

  // Get total students
  const studentsQuery = `
    SELECT COUNT(*) as total
    FROM students s
    JOIN users u ON s.user_id = u.id
    WHERE u.is_active = true
    ${userRole === "admin" || userRole === "teacher" ? "" : "AND s.user_id = $1"}
  `
  const studentsResult = await db.query(studentsQuery, userRole === "student" ? [userId] : [])
  const total_students = Number.parseInt(studentsResult[0]?.total || "0")

  // Get active internships
  const internshipsQuery = `
    SELECT COUNT(*) as total
    FROM internships i
    JOIN students s ON i.student_id = s.user_id
    JOIN users u ON s.user_id = u.id
    WHERE i.status = 'on_going' AND u.is_active = true
    ${userRole === "student" ? "AND i.student_id = $1" : ""}
  `
  const internshipsResult = await db.query(internshipsQuery, userRole === "student" ? [userId] : [])
  const active_internships = Number.parseInt(internshipsResult[0]?.total || "0")

  // Get pending documents (signatures)
  const documentsQuery = `
    SELECT COUNT(*) as total
    FROM signature_objects so
    WHERE so.is_verified = false AND so.is_revoked = false
    ${userRole === "student" ? "AND so.user_id = $1" : ""}
  `
  const documentsResult = await db.query(documentsQuery, userRole === "student" ? [userId] : [])
  const pending_documents = Number.parseInt(documentsResult[0]?.total || "0")

  // Get completed projects
  const projectsQuery = `
    SELECT COUNT(*) as total
    FROM academic_work aw
    JOIN students s ON aw.student_id = s.user_id
    WHERE aw.status = 'complete'
    ${userRole === "student" ? "AND aw.student_id = $1" : ""}
  `
  const projectsResult = await db.query(projectsQuery, userRole === "student" ? [userId] : [])
  const completed_projects = Number.parseInt(projectsResult[0]?.total || "0")

  // Get pending defenses
  const defensesQuery = `
    SELECT COUNT(*) as total
    FROM defenses d
    JOIN academic_work aw ON d.academic_work_id = aw.id
    WHERE d.decision = 'delayed'
    ${userRole === "student" ? "AND aw.student_id = $1" : ""}
  `
  const defensesResult = await db.query(defensesQuery, userRole === "student" ? [userId] : [])
  const pending_defenses = Number.parseInt(defensesResult[0]?.total || "0")

  // Get available rooms
  const roomsQuery = `
    SELECT COUNT(*) as total
    FROM rooms r
    WHERE r.is_active = true
  `
  const roomsResult = await db.query(roomsQuery)
  const available_rooms = Number.parseInt(roomsResult[0]?.total || "0")

  // Get recent activities
  const activitiesQuery = `
    SELECT 
      a.action_type,
      a.table_name,
      a.performed_at,
      u.first_name,
      u.last_name,
      u.role
    FROM audits a
    LEFT JOIN users u ON a.performed_by = u.id
    ORDER BY a.performed_at DESC
    LIMIT 10
  `
  const activitiesResult = await db.query(activitiesQuery)

  const recent_activities = activitiesResult.map((activity: any) => ({
    type: activity.action_type,
    message: `${activity.first_name || "System"} ${activity.action_type}d ${activity.table_name}`,
    timestamp: activity.performed_at,
    user: activity.first_name
      ? {
          first_name: activity.first_name,
          last_name: activity.last_name,
          role: activity.role,
        }
      : undefined,
  }))

  return {
    total_students,
    active_internships,
    pending_documents,
    completed_projects,
    pending_defenses,
    available_rooms,
    recent_activities,
  }
}
