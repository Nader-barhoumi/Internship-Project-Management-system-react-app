// Database connection and query utilities

import { Pool, type PoolClient } from "pg"
import type { User, Student, Internship } from "@/types/database"

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "internship_management",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
}

// Create connection pool
const pool = new Pool(dbConfig)

// Database connection wrapper
export class Database {
  private static instance: Database
  private pool: Pool

  private constructor() {
    this.pool = pool
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }

  // Execute query with connection from pool
  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const client = await this.pool.connect()
    try {
      const result = await client.query(text, params)
      return result.rows
    } finally {
      client.release()
    }
  }

  // Execute query with transaction support
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query("BEGIN")
      const result = await callback(client)
      await client.query("COMMIT")
      return result
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  // Close all connections
  async close(): Promise<void> {
    await this.pool.end()
  }
}

// Database access object (DAO) classes
export class UserDAO {
  private db: Database

  constructor() {
    this.db = Database.getInstance()
  }

  async findById(id: number): Promise<User | null> {
    const query = `
      SELECT u.*, a.address_details, a.city, a.state, a.zip_code
      FROM users u
      LEFT JOIN address a ON u.address_id = a.id
      WHERE u.id = $1 AND u.is_active = true
    `
    const users = await this.db.query<User>(query, [id])
    return users[0] || null
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT u.*, a.address_details, a.city, a.state, a.zip_code
      FROM users u
      LEFT JOIN address a ON u.address_id = a.id
      WHERE u.email = $1 AND u.is_active = true
    `
    const users = await this.db.query<User>(query, [email])
    return users[0] || null
  }

  async create(userData: Partial<User>): Promise<User> {
    const query = `
      INSERT INTO users (
        first_name, last_name, cin, email, phone, 
        password_hash, role, address_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    const values = [
      userData.first_name,
      userData.last_name,
      userData.cin,
      userData.email,
      userData.phone,
      userData.password_hash,
      userData.role,
      userData.address_id,
    ]
    const users = await this.db.query<User>(query, values)
    return users[0]
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const fields = Object.keys(userData)
      .filter((key) => key !== "id")
      .map((key, index) => `${key} = $${index + 2}`)
      .join(", ")

    const query = `
      UPDATE users 
      SET ${fields}, updated_at = NOW()
      WHERE id = $1 
      RETURNING *
    `
    const values = [id, ...Object.values(userData).filter((_, index) => Object.keys(userData)[index] !== "id")]
    const users = await this.db.query<User>(query, values)
    return users[0] || null
  }

  async delete(id: number): Promise<boolean> {
    const query = `UPDATE users SET is_active = false WHERE id = $1`
    await this.db.query(query, [id])
    return true
  }
}

export class StudentDAO {
  private db: Database

  constructor() {
    this.db = Database.getInstance()
  }

  async findAll(filters: any = {}): Promise<Student[]> {
    let query = `
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.profile_picture,
             dp.name as degree_name, dp.degree as degree_type
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN degree_program dp ON s.degree = dp.id
      WHERE u.is_active = true
    `
    const params: any[] = []
    let paramIndex = 1

    if (filters.level) {
      query += ` AND s.level = $${paramIndex}`
      params.push(filters.level)
      paramIndex++
    }

    if (filters.degree) {
      query += ` AND s.degree = $${paramIndex}`
      params.push(filters.degree)
      paramIndex++
    }

    if (filters.search) {
      query += ` AND (u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex} OR s.student_id ILIKE $${paramIndex})`
      params.push(`%${filters.search}%`)
      paramIndex++
    }

    query += ` ORDER BY u.last_name, u.first_name`

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`
      params.push(filters.limit)
      paramIndex++
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`
      params.push(filters.offset)
    }

    return await this.db.query<Student>(query, params)
  }

  async findById(userId: number): Promise<Student | null> {
    const query = `
      SELECT s.*, u.first_name, u.last_name, u.email, u.phone, u.profile_picture,
             dp.name as degree_name, dp.degree as degree_type
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN degree_program dp ON s.degree = dp.id
      WHERE s.user_id = $1 AND u.is_active = true
    `
    const students = await this.db.query<Student>(query, [userId])
    return students[0] || null
  }

  async create(studentData: Partial<Student>): Promise<Student> {
    const query = `
      INSERT INTO students (user_id, sex, student_id, degree, level)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `
    const values = [studentData.user_id, studentData.sex, studentData.student_id, studentData.degree, studentData.level]
    const students = await this.db.query<Student>(query, values)
    return students[0]
  }
}

export class InternshipDAO {
  private db: Database

  constructor() {
    this.db = Database.getInstance()
  }

  async findAll(filters: any = {}): Promise<Internship[]> {
    let query = `
      SELECT i.*, 
             s.student_id, u1.first_name as student_first_name, u1.last_name as student_last_name,
             c.name as company_name, c.field as company_field,
             u2.first_name as tutor_first_name, u2.last_name as tutor_last_name, it.job_title,
             aw.type as work_type, aw.status as work_status
      FROM internships i
      JOIN students s ON i.student_id = s.user_id
      JOIN users u1 ON s.user_id = u1.id
      JOIN companies c ON i.company_id = c.id
      JOIN industrial_tutors it ON i.industrial_tutor_id = it.user_id
      JOIN users u2 ON it.user_id = u2.id
      LEFT JOIN academic_work aw ON i.academic_work_id = aw.id
      WHERE u1.is_active = true AND c.is_active = true
    `
    const params: any[] = []
    let paramIndex = 1

    if (filters.status) {
      query += ` AND i.status = $${paramIndex}`
      params.push(filters.status)
      paramIndex++
    }

    if (filters.student_id) {
      query += ` AND i.student_id = $${paramIndex}`
      params.push(filters.student_id)
      paramIndex++
    }

    if (filters.company_id) {
      query += ` AND i.company_id = $${paramIndex}`
      params.push(filters.company_id)
      paramIndex++
    }

    if (filters.internship_type) {
      query += ` AND i.internship_type = $${paramIndex}`
      params.push(filters.internship_type)
      paramIndex++
    }

    query += ` ORDER BY i.start_date DESC`

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`
      params.push(filters.limit)
      paramIndex++
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex}`
      params.push(filters.offset)
    }

    return await this.db.query<Internship>(query, params)
  }

  async create(internshipData: Partial<Internship>): Promise<Internship> {
    const query = `
      INSERT INTO internships (
        student_id, academic_work_id, company_id, industrial_tutor_id,
        internship_type, start_date, end_date, company_signature
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `
    const values = [
      internshipData.student_id,
      internshipData.academic_work_id,
      internshipData.company_id,
      internshipData.industrial_tutor_id,
      internshipData.internship_type,
      internshipData.start_date,
      internshipData.end_date,
      internshipData.company_signature,
    ]
    const internships = await this.db.query<Internship>(query, values)
    return internships[0]
  }
}

// Export singleton instance
export const db = Database.getInstance()
export const userDAO = new UserDAO()
export const studentDAO = new StudentDAO()
export const internshipDAO = new InternshipDAO()
