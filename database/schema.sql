-- postgres sql script to create the database schema for the internship management system

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enumeration types
CREATE TYPE progress_status AS ENUM ('on_going', 'finished');
CREATE TYPE decision_status AS ENUM ('Pending', 'Accepted', 'Canceled', 'Refused');
CREATE TYPE role_type AS ENUM ('student', 'teacher', 'industrial_tutor', 'admin');
CREATE TYPE position_type AS ENUM ('Assistant_prof', 'Professor', 'Headmaster');
CREATE TYPE jury_spec AS ENUM ('president', 'reporter');
CREATE TYPE arch_mod AS ENUM ('statusless_archival', 'archival_after_revision', 'non_archival');
CREATE TYPE sex_type AS ENUM ('male', 'female');
CREATE TYPE category_type AS ENUM ('required', 'optional');
CREATE TYPE project_type AS ENUM ('industrial', 'didacted', 'tutored');
CREATE TYPE lvl_type AS ENUM ('1', '2', '3');
CREATE TYPE work_type AS ENUM ('summer internship', 'final year project', 'memoir', 'thesis');
CREATE TYPE defense_decision AS ENUM ('passed', 'failed', 'delayed');
CREATE TYPE work_status AS ENUM ('active', 'complete', 'archived');
CREATE TYPE signature_type AS ENUM ('digital', 'manual', 'biometric');
CREATE TYPE States AS ENUM ('Tunis','Ariana','Manouba','Ben Arous',' Nabeul','Zaghouan','Béja','Jendouba','Kasserine','Kef','Siliana','Sousse','Monastir','Mahdia','Sfax','Kairouan','Sidi Bouzid','Gafsa','Tozeur','Kébili','Medenine','Tataouine','Gabès');
CREATE TYPE degree_program_type AS ENUM ('Bachelor','Master','PhD');
CREATE TYPE otp_purpose AS ENUM ('document_confirmation', 'user_authentication', 'other');

-- Phase 1: Create all tables without foreign key references

CREATE TABLE address (
    id SERIAL PRIMARY KEY,
    address_details VARCHAR(255) NOT NULL,
    zip_code INT NOT NULL,
    city VARCHAR(20) NOT NULL,
    state States NOT NULL,
    additional_details VARCHAR(255)
);

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    external_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    profile_picture VARCHAR(255) NOT NULL DEFAULT 'assets/images/default-avatar.png',
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    cin VARCHAR(8) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT crypt('default', gen_salt('bf')),
    role role_type NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    address_id INT,
    reset_token VARCHAR(100),
    reset_token_expiry TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    external_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    legal_name VARCHAR(100),
    field VARCHAR(50),
    address_id INT,
    email VARCHAR(255),
    phone VARCHAR(20) NULL,
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE academic_institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    university VARCHAR(100) NOT NULL,
    phone INT NOT NULL,
    fax INT,
    address_id INT NULL,
    email VARCHAR(255) NOT NULL,
    director VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255) DEFAULT 'assets/images/default-logo.png'
);

CREATE TABLE degree_program (
    id VARCHAR(20) PRIMARY KEY,
    code VARCHAR(10) NULL UNIQUE,
    name VARCHAR(50) NULL UNIQUE,
    degree degree_program_type NOT NULL,
    major VARCHAR(50) NOT NULL,
    speciality VARCHAR(50) NOT NULL,
    duration_years INT NULL,
    description TEXT,
    institution VARCHAR(20)
);

CREATE TABLE majors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(20) NOT NULL,
    description TEXT
);

CREATE TABLE specialities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    code VARCHAR(10) NOT NULL UNIQUE,
    major VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE signature_objects (
    id SERIAL PRIMARY KEY,
    user_id INT,
    signer_name VARCHAR(100),
    external_email VARCHAR(100),
    signature_type VARCHAR(20) NOT NULL,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by INT,
    verified_at TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE,
    revoked_at TIMESTAMP
);

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    signature_object_id INT NOT NULL,
    signer_user_id INT,
    signer_email VARCHAR(100),
    signed_at TIMESTAMP DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_validated BOOLEAN DEFAULT FALSE,
    validated_by INT,
    validated_at TIMESTAMP
);

CREATE TABLE students (
    user_id INT PRIMARY KEY,
    sex sex_type,
    student_id VARCHAR(10) NOT NULL,
    degree VARCHAR(20) NOT NULL,
    level lvl_type NOT NULL
);

CREATE TABLE teachers (
    user_id INT PRIMARY KEY,
    title VARCHAR(50),
    position position_type,
    department VARCHAR(50) NULL,
    office_location VARCHAR(50),
    institution_id INT
);

CREATE TABLE industrial_tutors (
    user_id INT PRIMARY KEY,
    company_id INT NULL,
    job_title VARCHAR(50) NOT NULL
);

CREATE TABLE admins (
    user_id INT PRIMARY KEY,
    position VARCHAR(50) NOT NULL,
    access_level INT NOT NULL DEFAULT 1,
    can_manage_users BOOLEAN DEFAULT TRUE
);

CREATE TABLE academic_work (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    is_work_required BOOLEAN NOT NULL,
    type work_type NOT NULL,
    internship_required BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    max_collaborators INT DEFAULT 1,
    status work_status NOT NULL DEFAULT 'active',
    start_date DATE,
    end_date DATE
);

CREATE TABLE responsibilities (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    academic_work_id INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    assigned_by INT,
    assigned_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE specifications (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    objectives TEXT NOT NULL,
    main_tasks TEXT NOT NULL,
    student_profile TEXT NOT NULL,
    academic_tutor_signature INT,
    industrial_tutor_signature INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE internships (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    academic_work_id INT,
    company_id INT NOT NULL,
    industrial_tutor_id INT NOT NULL,
    internship_type category_type NOT NULL DEFAULT 'required',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    company_signature INT NOT NULL,
    status progress_status NOT NULL DEFAULT 'on_going'
);

CREATE TABLE prototypes (
    id SERIAL PRIMARY KEY,
    academic_work_id INT NOT NULL,
    submitted_at TIMESTAMP DEFAULT NOW(),
    file_url VARCHAR(500) NOT NULL,
    status decision_status NOT NULL DEFAULT 'Pending',
    review_comments TEXT
);

CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(100) NOT NULL,
    capacity INT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE room_reservations (
    id SERIAL PRIMARY KEY,
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    reservation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status progress_status NOT NULL DEFAULT 'on_going',
    purpose VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE jury_evaluations (
    id SERIAL PRIMARY KEY,
    defense_id INT NOT NULL,
    supervisor_id INT NOT NULL,
    president_id INT NOT NULL,
    reporter_id INT NOT NULL,
    score INT NOT NULL,
    evaluation_comments TEXT,
    evaluation_date TIMESTAMP DEFAULT NOW(),
    jury_role jury_spec NOT NULL
);

CREATE TABLE defenses (
    id SERIAL PRIMARY KEY,
    academic_work_id INT NOT NULL,
    prototype_id INT,
    reservation_id INT,
    decision defense_decision NOT NULL,
    jury_evaluation_id INT
);

CREATE TABLE final_projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    academic_work_id INT NOT NULL,
    internship_id INT,
    type project_type NOT NULL,
    academic_tutor_id INT NOT NULL,
    academic_tutor_signature INT,
    keywords TEXT[],
    required_skills TEXT[],
    decision decision_status NOT NULL DEFAULT 'Pending',
    submission_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE research_memoirs (
    id SERIAL PRIMARY KEY,
    academic_work_id INT NOT NULL,
    academic_tutor_id INT NOT NULL,
    status progress_status NOT NULL DEFAULT 'on_going',
    laboratory VARCHAR(100) NOT NULL,
    tutor_signature_id INT NOT NULL,
    lab_director VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    keywords TEXT[],
    decision decision_status NOT NULL DEFAULT 'Pending',
    submission_date TIMESTAMP DEFAULT NOW()
);

CREATE TABLE documents (
    id VARCHAR(50) PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    uploaded_by INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT NOW(),
    file_size BIGINT,
    file_type VARCHAR(10)
);

CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_firstname VARCHAR(50) NOT NULL,
    receiver_lastname VARCHAR(50) NOT NULL,
    receiver_email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    company_name INT,
    receiver_id INT NOT NULL,
    message TEXT,
    signature_id INT
);

CREATE TABLE audits (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action_type VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_by INT,
    performed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tutor_change_requests (
    id SERIAL PRIMARY KEY,
    internship_id INT NOT NULL,
    student_id INT NOT NULL,
    current_tutor_id INT NOT NULL,
    new_tutor_id INT NOT NULL,
    reason TEXT NOT NULL,
    status decision_status NOT NULL DEFAULT 'Pending',
    admin_validation BOOLEAN DEFAULT FALSE,
    validated_by INT,
    validated_at TIMESTAMP,
    new_tutor_signature INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE diploma_delivery (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL,
    academic_work_id INT NOT NULL,
    jury_evaluation_id INT NOT NULL,
    submitted_work BOOLEAN NOT NULL DEFAULT FALSE,
    returned_belongings BOOLEAN NOT NULL DEFAULT FALSE,
    diploma_id VARCHAR(500),
    delivered_by INT,
    delivered_at TIMESTAMP,
    status decision_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages related part of the schema
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    is_group BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE conversation_participants (
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Chatbot related part of the schema
CREATE TABLE chatbot_conversations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP
);

CREATE TABLE chatbot_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT REFERENCES chatbot_conversations(id) ON DELETE CASCADE,
    is_user_message BOOLEAN NOT NULL,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT NOW()
);

-- OTP verification related part of the schema
CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    purpose otp_purpose NOT NULL DEFAULT 'other',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    document_id VARCHAR(50) REFERENCES documents(id)
);

-- Phase 2: Add all constraints and foreign key references
-- [Foreign key constraints and indexes follow...]
