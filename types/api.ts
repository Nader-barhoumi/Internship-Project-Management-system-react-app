// API request/response types based on the database schema

import type {
  User,
  Student,
  IndustrialTutor,
  Company,
  Internship,
  AcademicWork,
  Document,
  FinalProject,
  ResearchMemoir,
  Defense,
  JuryEvaluation,
  Room,
  RoomReservation,
  Conversation,
  Message,
  DecisionStatus,
  ProgressStatus,
  WorkStatus,
  RoleType,
} from "./database"

// Authentication types
export interface LoginRequest {
  email: string
  password: string
  role: RoleType
}

export interface LoginResponse {
  user: User
  token: string
  expires_at: Date
}

export interface RegisterRequest {
  first_name: string
  last_name: string
  email: string
  password: string
  phone: string
  cin: string
  role: RoleType

  // Role-specific fields
  student_id?: string
  degree?: string
  level?: string
  company_id?: number
  job_title?: string
  department?: string
  position?: string
  access_level?: number
}

// Student management types
export interface StudentListResponse {
  students: (Student & { user: User })[]
  total: number
  page: number
  limit: number
}

export interface StudentCreateRequest {
  first_name: string
  last_name: string
  email: string
  phone: string
  cin: string
  student_id: string
  degree: string
  level: string
  sex?: "male" | "female"
  address?: {
    address_details: string
    city: string
    state: string
    zip_code: number
  }
}

// Internship management types
export interface InternshipListResponse {
  internships: (Internship & {
    student: Student & { user: User }
    company: Company
    industrial_tutor: IndustrialTutor & { user: User }
    academic_work?: AcademicWork
  })[]
  total: number
  page: number
  limit: number
}

export interface InternshipCreateRequest {
  student_id: number
  company_id: number
  industrial_tutor_id: number
  academic_work_id?: number
  internship_type: "required" | "optional"
  start_date: string
  end_date: string
  specifications?: {
    title: string
    objectives: string
    main_tasks: string
    student_profile: string
  }
}

export interface InternshipUpdateRequest {
  status?: ProgressStatus
  start_date?: string
  end_date?: string
  specifications_id?: number
}

// Company management types
export interface CompanyListResponse {
  companies: (Company & {
    address?: any
    industrial_tutors?: (IndustrialTutor & { user: User })[]
  })[]
  total: number
  page: number
  limit: number
}

export interface CompanyCreateRequest {
  name: string
  legal_name?: string
  field?: string
  email?: string
  phone?: string
  website?: string
  address?: {
    address_details: string
    city: string
    state: string
    zip_code: number
  }
}

// Academic work types
export interface AcademicWorkListResponse {
  academic_works: (AcademicWork & {
    student: Student & { user: User }
    responsibilities?: any[]
    internships?: Internship[]
    final_projects?: FinalProject[]
    research_memoirs?: ResearchMemoir[]
  })[]
  total: number
  page: number
  limit: number
}

export interface AcademicWorkCreateRequest {
  student_id: number
  type: "summer internship" | "final year project" | "memoir" | "thesis"
  is_work_required: boolean
  internship_required: boolean
  max_collaborators?: number
  start_date?: string
  end_date?: string
}

// Document management types
export interface DocumentListResponse {
  documents: (Document & {
    uploader: User
  })[]
  total: number
  page: number
  limit: number
}

export interface DocumentUploadRequest {
  type: string
  file: File
}

export interface DocumentUploadResponse {
  document: Document
  upload_url?: string
}

// Signature types
export interface SignatureCreateRequest {
  signature_type: "digital" | "manual" | "biometric"
  signer_name?: string
  external_email?: string
  image_file?: File
}

export interface SignatureValidateRequest {
  signature_id: number
  is_validated: boolean
  validation_comments?: string
}

// Defense and evaluation types
export interface DefenseListResponse {
  defenses: (Defense & {
    academic_work: AcademicWork & {
      student: Student & { user: User }
    }
    prototype?: any
    reservation?: RoomReservation & { room: Room }
    jury_evaluation?: JuryEvaluation
  })[]
  total: number
  page: number
  limit: number
}

export interface DefenseCreateRequest {
  academic_work_id: number
  prototype_id?: number
  reservation_id?: number
  jury_members: {
    supervisor_id: number
    president_id: number
    reporter_id: number
  }
}

export interface JuryEvaluationRequest {
  defense_id: number
  score: number
  evaluation_comments?: string
  jury_role: "president" | "reporter"
}

// Room management types
export interface RoomListResponse {
  rooms: Room[]
  total: number
  page: number
  limit: number
}

export interface RoomReservationRequest {
  room_id: number
  reservation_date: string
  start_time: string
  end_time: string
  purpose?: string
}

export interface RoomReservationListResponse {
  reservations: (RoomReservation & {
    room: Room
    user: User
  })[]
  total: number
  page: number
  limit: number
}

// Communication types
export interface ConversationListResponse {
  conversations: (Conversation & {
    participants: any[]
    last_message?: Message
  })[]
  total: number
  page: number
  limit: number
}

export interface MessageListResponse {
  messages: (Message & {
    sender: User
  })[]
  total: number
  page: number
  limit: number
}

export interface MessageSendRequest {
  conversation_id: number
  content: string
}

export interface ChatbotMessageRequest {
  content: string
  conversation_id?: number
}

export interface ChatbotMessageResponse {
  message: string
  conversation_id: number
}

// Statistics and dashboard types
export interface DashboardStats {
  total_students: number
  active_internships: number
  pending_documents: number
  completed_projects: number
  pending_defenses: number
  available_rooms: number
  recent_activities: {
    type: string
    message: string
    timestamp: Date
    user?: User
  }[]
}

// Search and filter types
export interface SearchFilters {
  query?: string
  role?: RoleType
  status?: ProgressStatus | WorkStatus | DecisionStatus
  department?: string
  company_id?: number
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: "asc" | "desc"
}

// Error response type
export interface ApiError {
  error: string
  message: string
  details?: any
  timestamp: Date
}

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    total?: number
    page?: number
    limit?: number
    has_next?: boolean
    has_prev?: boolean
  }
}
