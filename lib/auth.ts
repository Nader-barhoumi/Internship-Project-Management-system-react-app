// Authentication utilities and middleware

import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import { userDAO } from "./database"
import type { User } from "@/types/database"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface JWTPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export async function verifyToken(request: NextRequest): Promise<User | null> {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload

    // Get user from database to ensure they still exist and are active
    const user = await userDAO.findById(decoded.userId)
    if (!user || !user.is_active) {
      return null
    }

    return user
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function requireAuth(allowedRoles?: string[]) {
  return async (request: NextRequest) => {
    const user = await verifyToken(request)

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized", message: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      return new Response(JSON.stringify({ error: "Forbidden", message: "Insufficient permissions" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    }

    return user
  }
}

export function hashPassword(password: string): Promise<string> {
  const bcrypt = require("bcryptjs")
  return bcrypt.hash(password, 12)
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  const bcrypt = require("bcryptjs")
  return bcrypt.compare(password, hash)
}
