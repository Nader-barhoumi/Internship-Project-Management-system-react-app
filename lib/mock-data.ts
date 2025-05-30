// Mock data service for client-side development
// This simulates API calls without requiring actual backend connectivity

// Types
interface Student {
  id: number
  name: string
  email: string
  student_id: string
  degree_program: string
  academic_level: string
  phone?: string
  created_at: string
  updated_at: string
}

interface Company {
  id: number
  name: string
  industry: string
  email: string
  phone?: string
  address?: string
  description?: string
  created_at: string
  updated_at: string
}

interface Internship {
  id: number
  student_id: number
  company_id: number
  title: string
  description?: string
  start_date: string
  end_date: string
  status: "pending" | "active" | "completed" | "cancelled"
  created_at: string
  updated_at: string
}

interface Document {
  id: number
  title: string
  type: string
  status: "draft" | "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

// Initial mock data
const mockStudents: Student[] = [
  {
    id: 1,
    name: "Ahmed Ben Ali",
    email: "ahmed.benali@university.edu",
    student_id: "STU20210001",
    degree_program: "Computer Science",
    academic_level: "L3",
    phone: "+216 12 345 678",
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2023-01-15T10:30:00Z",
  },
  {
    id: 2,
    name: "Fatima Mansouri",
    email: "fatima.mansouri@university.edu",
    student_id: "STU20210015",
    degree_program: "Software Engineering",
    academic_level: "M1",
    phone: "+216 23 456 789",
    created_at: "2023-01-20T14:45:00Z",
    updated_at: "2023-01-20T14:45:00Z",
  },
  {
    id: 3,
    name: "Youssef Trabelsi",
    email: "youssef.trabelsi@university.edu",
    student_id: "STU20200089",
    degree_program: "Data Science",
    academic_level: "M2",
    phone: "+216 34 567 890",
    created_at: "2022-09-05T09:15:00Z",
    updated_at: "2022-09-05T09:15:00Z",
  },
]

const mockCompanies: Company[] = [
  {
    id: 1,
    name: "TechSolutions Tunisia",
    industry: "Technology",
    email: "contact@techsolutions.tn",
    phone: "+216 71 234 567",
    address: "Rue du Lac Constance, Les Berges du Lac, Tunis",
    description: "Leading software development company specializing in web and mobile applications.",
    created_at: "2022-06-10T08:00:00Z",
    updated_at: "2022-06-10T08:00:00Z",
  },
  {
    id: 2,
    name: "MedTech Innovations",
    industry: "Healthcare",
    email: "info@medtech.tn",
    phone: "+216 71 345 678",
    address: "Avenue Habib Bourguiba, Sousse",
    description: "Healthcare technology company focused on medical software solutions.",
    created_at: "2022-07-15T10:30:00Z",
    updated_at: "2022-07-15T10:30:00Z",
  },
  {
    id: 3,
    name: "FinancePro Consulting",
    industry: "Finance",
    email: "contact@financepro.tn",
    phone: "+216 71 456 789",
    address: "Rue Charles de Gaulle, Tunis",
    description: "Financial consulting and software solutions for banking and insurance sectors.",
    created_at: "2022-08-20T09:45:00Z",
    updated_at: "2022-08-20T09:45:00Z",
  },
]

const mockInternships: Internship[] = [
  {
    id: 1,
    student_id: 1,
    company_id: 1,
    title: "Web Development Internship",
    description: "Frontend development using React and Next.js",
    start_date: "2023-06-15",
    end_date: "2023-08-15",
    status: "completed",
    created_at: "2023-05-10T11:30:00Z",
    updated_at: "2023-05-10T11:30:00Z",
  },
  {
    id: 2,
    student_id: 2,
    company_id: 3,
    title: "Data Analysis Internship",
    description: "Financial data analysis and reporting",
    start_date: "2023-07-01",
    end_date: "2023-09-30",
    status: "active",
    created_at: "2023-06-15T14:00:00Z",
    updated_at: "2023-06-15T14:00:00Z",
  },
  {
    id: 3,
    student_id: 3,
    company_id: 2,
    title: "Machine Learning Research",
    description: "Research on ML applications in healthcare",
    start_date: "2023-09-01",
    end_date: "2023-12-31",
    status: "active",
    created_at: "2023-08-20T10:15:00Z",
    updated_at: "2023-08-20T10:15:00Z",
  },
]

const mockDocuments: Document[] = [
  {
    id: 1,
    title: "Internship Agreement - Ahmed Ben Ali",
    type: "Internship Agreement",
    status: "approved",
    created_at: "2023-05-12T09:30:00Z",
    updated_at: "2023-05-15T14:20:00Z",
  },
  {
    id: 2,
    title: "Evaluation Form - Fatima Mansouri",
    type: "Evaluation Form",
    status: "pending",
    created_at: "2023-07-05T11:45:00Z",
    updated_at: "2023-07-05T11:45:00Z",
  },
  {
    id: 3,
    title: "Final Report - Youssef Trabelsi",
    type: "Final Report",
    status: "draft",
    created_at: "2023-09-10T16:30:00Z",
    updated_at: "2023-09-10T16:30:00Z",
  },
]

// Mock data service
class MockDataService {
  private students: Student[] = [...mockStudents]
  private companies: Company[] = [...mockCompanies]
  private internships: Internship[] = [...mockInternships]
  private documents: Document[] = [...mockDocuments]

  // Helper to simulate network delay
  private async delay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // Students
  async getStudents({
    page = 1,
    limit = 10,
    search = "",
    level = "",
    degree = "",
  }: {
    page?: number
    limit?: number
    search?: string
    level?: string
    degree?: string
  }) {
    await this.delay()

    let filteredStudents = [...this.students]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredStudents = filteredStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower) ||
          student.student_id.toLowerCase().includes(searchLower),
      )
    }

    if (level) {
      filteredStudents = filteredStudents.filter((student) => student.academic_level === level)
    }

    if (degree) {
      filteredStudents = filteredStudents.filter((student) => student.degree_program === degree)
    }

    const totalItems = filteredStudents.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      data: filteredStudents.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    }
  }

  async getStudentById(id: number) {
    await this.delay()
    const student = this.students.find((s) => s.id === id)
    if (!student) throw new Error("Student not found")
    return student
  }

  async createStudent(data: Partial<Student>) {
    await this.delay()
    const newStudent: Student = {
      id: this.students.length + 1,
      name: data.name || "",
      email: data.email || "",
      student_id: data.student_id || "",
      degree_program: data.degree_program || "",
      academic_level: data.academic_level || "",
      phone: data.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.students.push(newStudent)
    return newStudent
  }

  async updateStudent(id: number, data: Partial<Student>) {
    await this.delay()
    const index = this.students.findIndex((s) => s.id === id)
    if (index === -1) throw new Error("Student not found")

    this.students[index] = {
      ...this.students[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return this.students[index]
  }

  async deleteStudent(id: number) {
    await this.delay()
    const index = this.students.findIndex((s) => s.id === id)
    if (index === -1) throw new Error("Student not found")

    const deleted = this.students.splice(index, 1)[0]
    return deleted
  }

  // Companies
  async getCompanies({
    page = 1,
    limit = 10,
    search = "",
    industry = "",
  }: {
    page?: number
    limit?: number
    search?: string
    industry?: string
  }) {
    await this.delay()

    let filteredCompanies = [...this.companies]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredCompanies = filteredCompanies.filter(
        (company) =>
          company.name.toLowerCase().includes(searchLower) ||
          company.email.toLowerCase().includes(searchLower) ||
          (company.description && company.description.toLowerCase().includes(searchLower)),
      )
    }

    if (industry) {
      filteredCompanies = filteredCompanies.filter((company) => company.industry === industry)
    }

    const totalItems = filteredCompanies.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      data: filteredCompanies.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    }
  }

  async getCompanyById(id: number) {
    await this.delay()
    const company = this.companies.find((c) => c.id === id)
    if (!company) throw new Error("Company not found")
    return company
  }

  async createCompany(data: Partial<Company>) {
    await this.delay()
    const newCompany: Company = {
      id: this.companies.length + 1,
      name: data.name || "",
      industry: data.industry || "",
      email: data.email || "",
      phone: data.phone,
      address: data.address,
      description: data.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.companies.push(newCompany)
    return newCompany
  }

  async updateCompany(id: number, data: Partial<Company>) {
    await this.delay()
    const index = this.companies.findIndex((c) => c.id === id)
    if (index === -1) throw new Error("Company not found")

    this.companies[index] = {
      ...this.companies[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return this.companies[index]
  }

  async deleteCompany(id: number) {
    await this.delay()
    const index = this.companies.findIndex((c) => c.id === id)
    if (index === -1) throw new Error("Company not found")

    const deleted = this.companies.splice(index, 1)[0]
    return deleted
  }

  // Internships
  async getInternships({
    page = 1,
    limit = 10,
    search = "",
    status = "",
    studentId = null,
    companyId = null,
  }: {
    page?: number
    limit?: number
    search?: string
    status?: string
    studentId?: number | null
    companyId?: number | null
  }) {
    await this.delay()

    let filteredInternships = [...this.internships]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredInternships = filteredInternships.filter(
        (internship) =>
          internship.title.toLowerCase().includes(searchLower) ||
          (internship.description && internship.description.toLowerCase().includes(searchLower)),
      )
    }

    if (status) {
      filteredInternships = filteredInternships.filter((internship) => internship.status === status)
    }

    if (studentId) {
      filteredInternships = filteredInternships.filter((internship) => internship.student_id === studentId)
    }

    if (companyId) {
      filteredInternships = filteredInternships.filter((internship) => internship.company_id === companyId)
    }

    const totalItems = filteredInternships.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      data: filteredInternships.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    }
  }

  async getInternshipById(id: number) {
    await this.delay()
    const internship = this.internships.find((i) => i.id === id)
    if (!internship) throw new Error("Internship not found")
    return internship
  }

  async createInternship(data: Partial<Internship>) {
    await this.delay()
    const newInternship: Internship = {
      id: this.internships.length + 1,
      student_id: data.student_id || 0,
      company_id: data.company_id || 0,
      title: data.title || "",
      description: data.description,
      start_date: data.start_date || "",
      end_date: data.end_date || "",
      status: data.status || "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.internships.push(newInternship)
    return newInternship
  }

  async updateInternship(id: number, data: Partial<Internship>) {
    await this.delay()
    const index = this.internships.findIndex((i) => i.id === id)
    if (index === -1) throw new Error("Internship not found")

    this.internships[index] = {
      ...this.internships[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return this.internships[index]
  }

  async deleteInternship(id: number) {
    await this.delay()
    const index = this.internships.findIndex((i) => i.id === id)
    if (index === -1) throw new Error("Internship not found")

    const deleted = this.internships.splice(index, 1)[0]
    return deleted
  }

  // Documents
  async getDocuments({
    page = 1,
    limit = 10,
    search = "",
    type = "",
    status = "",
  }: {
    page?: number
    limit?: number
    search?: string
    type?: string
    status?: string
  }) {
    await this.delay()

    let filteredDocuments = [...this.documents]

    if (search) {
      const searchLower = search.toLowerCase()
      filteredDocuments = filteredDocuments.filter((document) => document.title.toLowerCase().includes(searchLower))
    }

    if (type) {
      filteredDocuments = filteredDocuments.filter((document) => document.type === type)
    }

    if (status) {
      filteredDocuments = filteredDocuments.filter((document) => document.status === status)
    }

    const totalItems = filteredDocuments.length
    const totalPages = Math.ceil(totalItems / limit)
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    return {
      data: filteredDocuments.slice(startIndex, endIndex),
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
      },
    }
  }

  async getDocumentById(id: number) {
    await this.delay()
    const document = this.documents.find((d) => d.id === id)
    if (!document) throw new Error("Document not found")
    return document
  }

  async createDocument(data: Partial<Document>) {
    await this.delay()
    const newDocument: Document = {
      id: this.documents.length + 1,
      title: data.title || "",
      type: data.type || "",
      status: data.status || "draft",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.documents.push(newDocument)
    return newDocument
  }

  async updateDocument(id: number, data: Partial<Document>) {
    await this.delay()
    const index = this.documents.findIndex((d) => d.id === id)
    if (index === -1) throw new Error("Document not found")

    this.documents[index] = {
      ...this.documents[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    return this.documents[index]
  }

  async deleteDocument(id: number) {
    await this.delay()
    const index = this.documents.findIndex((d) => d.id === id)
    if (index === -1) throw new Error("Document not found")

    const deleted = this.documents.splice(index, 1)[0]
    return deleted
  }

  // Dashboard stats
  async getDashboardStats() {
    await this.delay()
    return {
      totalStudents: this.students.length,
      activeInternships: this.internships.filter((i) => i.status === "active").length,
      pendingDocuments: this.documents.filter((d) => d.status === "pending").length,
      completedProjects: this.internships.filter((i) => i.status === "completed").length,
    }
  }
}

// Export a singleton instance
export const mockDataService = new MockDataService()
