// Database schema types based on the PostgreSQL schema

// Enum types
export type ProgressStatus = "on_going" | "finished"
export type DecisionStatus = "Pending" | "Accepted" | "Canceled" | "Refused"
export type RoleType = "student" | "teacher" | "industrial_tutor" | "admin"
export type PositionType = "Assistant_prof" | "Professor" | "Headmaster"
export type JurySpec = "president" | "reporter"
export type ArchMod = "statusless_archival" | "archival_after_revision" | "non_archival"
export type SexType = "male" | "female"
export type CategoryType = "required" | "optional"
export type ProjectType = "industrial" | "didacted" | "tutored"
export type LevelType = "1" | "2" | "3"
export type WorkType = "summer internship" | "final year project" | "memoir" | "thesis"
export type DefenseDecision = "passed" | "failed" | "delayed"
export type WorkStatus = "active" | "complete" | "archived"
export type SignatureType = "digital" | "manual" | "biometric"
export type DegreeProgramType = "Bachelor" | "Master" | "PhD"
export type OtpPurpose = "document_confirmation" | "user_authentication" | "other"

export type TunisianStates =
  | "Tunis"
  | "Ariana"
  | "Manouba"
  | "Ben Arous"
  | "Nabeul"
  | "Zaghouan"
  | "Béja"
  | "Jendouba"
  | "Kasserine"
  | "Kef"
  | "Siliana"
  | "Sousse"
  | "Monastir"
  | "Mahdia"
  | "Sfax"
  | "Kairouan"
  | "Sidi Bouzid"
  | "Gafsa"
  | "Tozeur"
  | "Kébili"
  | "Medenine"
  | "Tataouine"
  | "Gabès"

// Core entity interfaces
export interface Address {
  id: number
  address_details: string
  zip_code: number
  city: string
  state: TunisianStates
  additional_details?: string
}

export interface Department {
  id: number
  name: string
  code: string
}

export interface User {
  id: number
  external_id: string
  profile_picture: string
  first_name: string
  last_name: string
  cin: string
  email: string
  phone: string
  password_hash: string
  role: RoleType
  created_at: Date
  address_id?: number
  reset_token?: string
  reset_token_expiry?: Date
  last_login?: Date
  is_active: boolean

  // Relations
  address?: Address
}

export interface Company {
  id: number
  external_id: string
  name: string
  legal_name?: string
  field?: string
  address_id?: number
  email?: string
  phone?: string
  website?: string
  is_active: boolean

  // Relations
  address?: Address
  industrial_tutors?: IndustrialTutor[]
}

export interface AcademicInstitution {
  id: number
  name: string
  university: string
  phone: number
  fax?: number
  address_id?: number
  email: string
  director: string
  logo_url: string

  // Relations
  address?: Address
  teachers?: Teacher[]
}

export interface DegreeProgram {
  id: string
  code?: string
  name?: string
  degree: DegreeProgramType
  major: string
  speciality: string
  duration_years?: number
  description?: string
  institution?: string

  // Relations
  academic_institution?: AcademicInstitution
}

export interface Major {
  id: number
  name: string
  department: string
  description?: string

  // Relations
  department_ref?: Department
  specialities?: Speciality[]
}

export interface Speciality {
  id: number
  name: string
  code: string
  major: string
  description?: string

  // Relations
  major_ref?: Major
}

export interface SignatureObject {
  id: number
  user_id?: number
  signer_name?: string
  external_email?: string
  signature_type: string
  image_url?: string
  created_at: Date
  is_verified: boolean
  verified_by?: number
  verified_at?: Date
  is_revoked: boolean
  revoked_at?: Date

  // Relations
  user?: User
  verifier?: User
  signatures?: Signature[]
}

export interface Signature {
  id: number
  signature_object_id: number
  signer_user_id?: number
  signer_email?: string
  signed_at: Date
  ip_address?: string
  user_agent?: string
  is_validated: boolean
  validated_by?: number
  validated_at?: Date

  // Relations
  signature_object?: SignatureObject
  signer?: User
  validator?: User
}

export interface Student {
  user_id: number
  sex?: SexType
  student_id: string
  degree: string
  level: LevelType

  // Relations
  user?: User
  degree_program?: DegreeProgram
  academic_works?: AcademicWork[]
  internships?: Internship[]
}

export interface Teacher {
  user_id: number
  title?: string
  position?: PositionType
  department?: string
  office_location?: string
  institution_id?: number

  // Relations
  user?: User
  department_ref?: Department
  institution?: AcademicInstitution
  responsibilities?: Responsibility[]
  final_projects?: FinalProject[]
  research_memoirs?: ResearchMemoir[]
}

export interface IndustrialTutor {
  user_id: number
  company_id?: number
  job_title: string

  // Relations
  user?: User
  company?: Company
  internships?: Internship[]
  final_projects?: FinalProject[]
}

export interface Admin {
  user_id: number
  position: string
  access_level: number
  can_manage_users: boolean

  // Relations
  user?: User
  invitations?: Invitation[]
  diploma_deliveries?: DiplomaDelivery[]
}

export interface AcademicWork {
  id: number
  student_id: number
  is_work_required: boolean
  type: WorkType
  internship_required: boolean
  created_at: Date
  max_collaborators: number
  status: WorkStatus
  start_date?: Date
  end_date?: Date

  // Relations
  student?: Student
  responsibilities?: Responsibility[]
  internships?: Internship[]
  prototypes?: Prototype[]
  defenses?: Defense[]
  final_projects?: FinalProject[]
  research_memoirs?: ResearchMemoir[]
}

export interface Responsibility {
  id: number
  user_id: number
  academic_work_id: number
  role: string
  assigned_by?: number
  assigned_at: Date

  // Relations
  user?: User
  academic_work?: AcademicWork
  assigner?: User
}

export interface Specification {
  id: number
  title: string
  objectives: string
  main_tasks: string
  student_profile: string
  academic_tutor_signature?: number
  industrial_tutor_signature?: number
  created_at: Date
  updated_at: Date

  // Relations
  academic_signature?: Signature
  industrial_signature?: Signature
}

export interface Internship {
  id: number
  student_id: number
  academic_work_id?: number
  company_id: number
  industrial_tutor_id: number
  internship_type: CategoryType
  start_date: Date
  end_date: Date
  company_signature: number
  status: ProgressStatus

  // Relations
  student?: Student
  academic_work?: AcademicWork
  company?: Company
  industrial_tutor?: IndustrialTutor
  company_signature_ref?: Signature
  final_projects?: FinalProject[]
  tutor_change_requests?: TutorChangeRequest[]
}

export interface Prototype {
  id: number
  academic_work_id: number
  submitted_at: Date
  file_url: string
  status: DecisionStatus
  review_comments?: string

  // Relations
  academic_work?: AcademicWork
  defenses?: Defense[]
}

export interface Room {
  id: number
  name: string
  location: string
  capacity?: number
  is_active: boolean

  // Relations
  reservations?: RoomReservation[]
}

export interface RoomReservation {
  id: number
  room_id: number
  user_id: number
  reservation_date: Date
  start_time: string
  end_time: string
  status: ProgressStatus
  purpose?: string
  created_at: Date

  // Relations
  room?: Room
  user?: User
  defenses?: Defense[]
}

export interface JuryEvaluation {
  id: number
  defense_id: number
  supervisor_id: number
  president_id: number
  reporter_id: number
  score: number
  evaluation_comments?: string
  evaluation_date: Date
  jury_role: JurySpec

  // Relations
  defense?: Defense
  supervisor?: Teacher
  president?: Teacher
  reporter?: Teacher
  diploma_deliveries?: DiplomaDelivery[]
}

export interface Defense {
  id: number
  academic_work_id: number
  prototype_id?: number
  reservation_id?: number
  decision: DefenseDecision
  jury_evaluation_id?: number

  // Relations
  academic_work?: AcademicWork
  prototype?: Prototype
  reservation?: RoomReservation
  jury_evaluation?: JuryEvaluation
}

export interface FinalProject {
  id: number
  title: string
  academic_work_id: number
  internship_id?: number
  type: ProjectType
  academic_tutor_id: number
  academic_tutor_signature?: number
  keywords?: string[]
  required_skills?: string[]
  decision: DecisionStatus
  submission_date: Date

  // Relations
  academic_work?: AcademicWork
  internship?: Internship
  academic_tutor?: Teacher
  academic_signature?: Signature
}

export interface ResearchMemoir {
  id: number
  academic_work_id: number
  academic_tutor_id: number
  status: ProgressStatus
  laboratory: string
  tutor_signature_id: number
  lab_director: string
  summary: string
  keywords?: string[]
  decision: DecisionStatus
  submission_date: Date

  // Relations
  academic_work?: AcademicWork
  academic_tutor?: Teacher
  tutor_signature?: Signature
}

export interface Document {
  id: string
  type: string
  file_url: string
  uploaded_by: number
  uploaded_at: Date
  file_size?: number
  file_type?: string

  // Relations
  uploader?: User
  otp_verifications?: OtpVerification[]
}

export interface Invitation {
  id: number
  sender_id: number
  receiver_firstname: string
  receiver_lastname: string
  receiver_email: string
  phone?: string
  company_name?: number
  receiver_id: number
  message?: string
  signature_id?: number

  // Relations
  sender?: Admin
  signature?: Signature
}

export interface Audit {
  id: number
  table_name: string
  record_id: number
  action_type: string
  old_data?: any
  new_data?: any
  performed_by?: number
  performed_at: Date

  // Relations
  performer?: User
}

export interface TutorChangeRequest {
  id: number
  internship_id: number
  student_id: number
  current_tutor_id: number
  new_tutor_id: number
  reason: string
  status: DecisionStatus
  admin_validation: boolean
  validated_by?: number
  validated_at?: Date
  new_tutor_signature?: number
  created_at: Date
  updated_at: Date

  // Relations
  internship?: Internship
  student?: Student
  current_tutor?: IndustrialTutor
  new_tutor?: IndustrialTutor
  validator?: Admin
  signature?: Signature
}

export interface DiplomaDelivery {
  id: number
  student_id: number
  academic_work_id: number
  jury_evaluation_id: number
  submitted_work: boolean
  returned_belongings: boolean
  diploma_id?: string
  delivered_by?: number
  delivered_at?: Date
  status: DecisionStatus
  created_at: Date
  updated_at: Date

  // Relations
  student?: Student
  academic_work?: AcademicWork
  jury_evaluation?: JuryEvaluation
  deliverer?: Admin
}

// Communication interfaces
export interface Conversation {
  id: number
  is_group: boolean
  created_at: Date
  updated_at: Date
  is_active: boolean

  // Relations
  participants?: ConversationParticipant[]
  messages?: Message[]
}

export interface ConversationParticipant {
  conversation_id: number
  user_id: number
  joined_at: Date

  // Relations
  conversation?: Conversation
  user?: User
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  sent_at: Date
  is_read: boolean

  // Relations
  conversation?: Conversation
  sender?: User
}

export interface ChatbotConversation {
  id: number
  user_id: number
  started_at: Date
  ended_at?: Date

  // Relations
  user?: User
  messages?: ChatbotMessage[]
}

export interface ChatbotMessage {
  id: number
  conversation_id: number
  is_user_message: boolean
  content: string
  sent_at: Date

  // Relations
  conversation?: ChatbotConversation
}

export interface OtpVerification {
  id: number
  user_id: number
  email: string
  otp_code: string
  purpose: OtpPurpose
  created_at: Date
  expires_at: Date
  is_used: boolean
  document_id?: string

  // Relations
  user?: User
  document?: Document
}
