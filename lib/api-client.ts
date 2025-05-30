import { mockDataService } from "./mock-data"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }
  }

  // Students endpoints - using mock data for preview
  async getStudents(filters: any = {}) {
    try {
      const response = await mockDataService.getStudents({
        page: Number.parseInt(filters.page || "1"),
        limit: Number.parseInt(filters.limit || "10"),
        search: filters.search || "",
        level: filters.level || "",
        degree: filters.degree || "",
      })

      // Transform the data to match the expected format
      return {
        students: response.data || [],
        total: response.pagination?.totalItems || 0,
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      return {
        students: [],
        total: 0,
        page: 1,
        limit: 10,
      }
    }
  }

  async getStudent(id: number) {
    try {
      return await mockDataService.getStudentById(id)
    } catch (error) {
      console.error("Error fetching student:", error)
      return null
    }
  }

  async createStudent(studentData: any) {
    try {
      return await mockDataService.createStudent({
        name: `${studentData.first_name} ${studentData.last_name}`,
        email: studentData.email,
        student_id: studentData.student_id,
        degree_program: studentData.degree,
        academic_level: studentData.level,
        phone: studentData.phone,
      })
    } catch (error) {
      console.error("Error creating student:", error)
      throw error
    }
  }

  async updateStudent(id: number, studentData: any) {
    try {
      return await mockDataService.updateStudent(id, studentData)
    } catch (error) {
      console.error("Error updating student:", error)
      throw error
    }
  }

  async deleteStudent(id: number) {
    try {
      return await mockDataService.deleteStudent(id)
    } catch (error) {
      console.error("Error deleting student:", error)
      throw error
    }
  }

  // Companies endpoints - using mock data for preview
  async getCompanies(filters: any = {}) {
    try {
      const response = await mockDataService.getCompanies({
        page: Number.parseInt(filters.page || "1"),
        limit: Number.parseInt(filters.limit || "10"),
        search: filters.search || "",
        industry: filters.industry || "",
      })

      return {
        companies: response.data || [],
        total: response.pagination?.totalItems || 0,
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      return {
        companies: [],
        total: 0,
        page: 1,
        limit: 10,
      }
    }
  }

  async getCompany(id: number) {
    try {
      return await mockDataService.getCompanyById(id)
    } catch (error) {
      console.error("Error fetching company:", error)
      return null
    }
  }

  async createCompany(companyData: any) {
    try {
      return await mockDataService.createCompany(companyData)
    } catch (error) {
      console.error("Error creating company:", error)
      throw error
    }
  }

  async updateCompany(id: number, companyData: any) {
    try {
      return await mockDataService.updateCompany(id, companyData)
    } catch (error) {
      console.error("Error updating company:", error)
      throw error
    }
  }

  async deleteCompany(id: number) {
    try {
      return await mockDataService.deleteCompany(id)
    } catch (error) {
      console.error("Error deleting company:", error)
      throw error
    }
  }

  // Internships endpoints - using mock data for preview
  async getInternships(filters: any = {}) {
    try {
      const response = await mockDataService.getInternships({
        page: Number.parseInt(filters.page || "1"),
        limit: Number.parseInt(filters.limit || "10"),
        search: filters.search || "",
        status: filters.status || "",
        studentId: filters.studentId ? Number.parseInt(filters.studentId) : null,
        companyId: filters.companyId ? Number.parseInt(filters.companyId) : null,
      })

      return {
        internships: response.data || [],
        total: response.pagination?.totalItems || 0,
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
      }
    } catch (error) {
      console.error("Error fetching internships:", error)
      return {
        internships: [],
        total: 0,
        page: 1,
        limit: 10,
      }
    }
  }

  async getInternship(id: number) {
    try {
      return await mockDataService.getInternshipById(id)
    } catch (error) {
      console.error("Error fetching internship:", error)
      return null
    }
  }

  async createInternship(internshipData: any) {
    try {
      return await mockDataService.createInternship(internshipData)
    } catch (error) {
      console.error("Error creating internship:", error)
      throw error
    }
  }

  async updateInternship(id: number, internshipData: any) {
    try {
      return await mockDataService.updateInternship(id, internshipData)
    } catch (error) {
      console.error("Error updating internship:", error)
      throw error
    }
  }

  async deleteInternship(id: number) {
    try {
      return await mockDataService.deleteInternship(id)
    } catch (error) {
      console.error("Error deleting internship:", error)
      throw error
    }
  }

  // Dashboard endpoints - using mock data for preview
  async getDashboardStats() {
    try {
      return await mockDataService.getDashboardStats()
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      return {
        totalStudents: 0,
        activeInternships: 0,
        pendingDocuments: 0,
        completedProjects: 0,
      }
    }
  }

  async getRecentActivities() {
    try {
      // Mock recent activities
      return [
        {
          id: 1,
          type: "student_created",
          description: "New student registered",
          timestamp: new Date(),
        },
        {
          id: 2,
          type: "internship_created",
          description: "New internship created",
          timestamp: new Date(Date.now() - 86400000),
        },
        {
          id: 3,
          type: "document_approved",
          description: "Document approved",
          timestamp: new Date(Date.now() - 172800000),
        },
      ]
    } catch (error) {
      console.error("Error fetching recent activities:", error)
      return []
    }
  }

  // Documents endpoints - mock for preview
  async getDocuments(filters: any = {}) {
    try {
      const response = await mockDataService.getDocuments({
        page: Number.parseInt(filters.page || "1"),
        limit: Number.parseInt(filters.limit || "10"),
        search: filters.search || "",
        type: filters.type || "",
        status: filters.status || "",
      })

      return {
        documents: response.data || [],
        total: response.pagination?.totalItems || 0,
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 10,
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
      return {
        documents: [],
        total: 0,
        page: 1,
        limit: 10,
      }
    }
  }

  async uploadDocument(formData: FormData) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return {
        success: true,
        document: {
          id: Date.now().toString(),
          name: "document.pdf",
          type: "application/pdf",
          size: 1024000,
          uploaded_at: new Date(),
        },
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      throw error
    }
  }

  async getDocument(id: string) {
    try {
      return await mockDataService.getDocumentById(Number.parseInt(id))
    } catch (error) {
      console.error("Error fetching document:", error)
      return null
    }
  }

  async deleteDocument(id: string) {
    try {
      return await mockDataService.deleteDocument(Number.parseInt(id))
    } catch (error) {
      console.error("Error deleting document:", error)
      throw error
    }
  }

  // Academic work endpoints - mock for preview
  async getAcademicWorks(filters: any = {}) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return {
        works: [],
        total: 0,
      }
    } catch (error) {
      console.error("Error fetching academic works:", error)
      return {
        works: [],
        total: 0,
      }
    }
  }

  async createAcademicWork(workData: any) {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      return {
        success: true,
        work: {
          id: Date.now(),
          title: workData.title,
          type: workData.type,
          created_at: new Date(),
        },
      }
    } catch (error) {
      console.error("Error creating academic work:", error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()
