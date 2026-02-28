-- ===========================================
-- Google Form Clone Database Schema (Level 2)
-- ===========================================
-- This file contains all SQL commands to set up the database.
-- Run this file in PostgreSQL to create all necessary tables.
-- Version: 2.0 - Added Questions, Responses, and Answers tables

-- ===========================================
-- Create Database (run this separately if needed)
-- ===========================================
-- CREATE DATABASE google_form_clone;

-- ===========================================
-- Enable UUID Extension
-- ===========================================
-- This allows us to use uuid_generate_v4() for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Users Table
-- ===========================================
-- Stores user account information
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster email lookups (login, registration check)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ===========================================
-- Forms Table
-- ===========================================
-- Stores form metadata
-- status: 'draft' | 'published' | 'closed'
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    is_published BOOLEAN DEFAULT FALSE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);

-- Index for finding published forms
CREATE INDEX IF NOT EXISTS idx_forms_is_published ON forms(is_published);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);

-- Composite index for user's forms ordered by date
CREATE INDEX IF NOT EXISTS idx_forms_user_created ON forms(user_id, created_at DESC);

-- Index for title search (supports ILIKE queries)
CREATE INDEX IF NOT EXISTS idx_forms_title_trgm ON forms USING gin (title gin_trgm_ops);

-- ===========================================
-- Questions Table
-- ===========================================
-- Stores questions belonging to forms
-- type: 'short_answer' | 'multiple_choice' | 'checkbox' | 'dropdown'
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('short_answer', 'multiple_choice', 'checkbox', 'dropdown')),
    options JSONB DEFAULT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by form
CREATE INDEX IF NOT EXISTS idx_questions_form_id ON questions(form_id);

-- Composite index for ordered questions within a form
CREATE INDEX IF NOT EXISTS idx_questions_form_order ON questions(form_id, order_index);

-- ===========================================
-- Responses Table
-- ===========================================
-- Stores form submissions (one response per form submission)
CREATE TABLE IF NOT EXISTS responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by form
CREATE INDEX IF NOT EXISTS idx_responses_form_id ON responses(form_id);

-- Index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON responses(user_id);

-- Composite index for form responses ordered by date
CREATE INDEX IF NOT EXISTS idx_responses_form_submitted ON responses(form_id, submitted_at DESC);

-- ===========================================
-- Answers Table
-- ===========================================
-- Stores individual answers within a response
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    response_id UUID NOT NULL REFERENCES responses(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups by response
CREATE INDEX IF NOT EXISTS idx_answers_response_id ON answers(response_id);

-- Index for faster lookups by question
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);

-- Unique constraint to prevent duplicate answers for same question in same response
CREATE UNIQUE INDEX IF NOT EXISTS idx_answers_response_question ON answers(response_id, question_id);

-- ===========================================
-- Function to auto-update updated_at timestamp
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ===========================================
-- Triggers for auto-updating updated_at
-- ===========================================
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forms_updated_at ON forms;
CREATE TRIGGER update_forms_updated_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_questions_updated_at ON questions;
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- Enable pg_trgm extension for text search
-- ===========================================
-- This extension provides trigram-based text search capabilities
-- Required for the gin_trgm_ops index on forms.title
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ===========================================
-- Migration Script (for existing databases)
-- ===========================================
-- Run this section if upgrading from Level 1 to Level 2

-- Add status column to forms if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'forms' AND column_name = 'status'
    ) THEN
        ALTER TABLE forms ADD COLUMN status VARCHAR(20) DEFAULT 'draft' 
            CHECK (status IN ('draft', 'published', 'closed'));
        
        -- Update existing records: set status based on is_published
        UPDATE forms SET status = CASE 
            WHEN is_published = true THEN 'published' 
            ELSE 'draft' 
        END;
    END IF;
END $$;

-- ===========================================
-- Sample Data (Optional - for testing)
-- ===========================================
-- Uncomment below to insert sample data

-- INSERT INTO users (name, email, password) VALUES
-- ('Test User', 'test@example.com', '$2b$12$your_hashed_password_here');

-- INSERT INTO forms (title, description, user_id, status, is_published) VALUES
-- ('Customer Feedback', 'Help us improve our service', (SELECT id FROM users WHERE email = 'test@example.com'), 'published', true),
-- ('Event Registration', 'Register for our upcoming event', (SELECT id FROM users WHERE email = 'test@example.com'), 'draft', false);

-- ===========================================
-- Useful Queries (for reference)
-- ===========================================

-- Get all forms with owner info:
-- SELECT f.*, u.name as owner_name, u.email as owner_email
-- FROM forms f JOIN users u ON f.user_id = u.id;

-- Get form with questions:
-- SELECT f.*, json_agg(q.*) as questions
-- FROM forms f
-- LEFT JOIN questions q ON q.form_id = f.id
-- WHERE f.id = 'form-uuid-here'
-- GROUP BY f.id;

-- Get form response count:
-- SELECT f.id, f.title, COUNT(r.id) as response_count
-- FROM forms f
-- LEFT JOIN responses r ON r.form_id = f.id
-- GROUP BY f.id, f.title;

-- Check if form has submissions (for business constraint):
-- SELECT EXISTS(SELECT 1 FROM responses WHERE form_id = 'form-uuid-here') as has_submissions;
-- FROM forms f
-- JOIN users u ON f.user_id = u.id;

-- Get form count by user:
-- SELECT u.name, COUNT(f.id) as form_count
-- FROM users u
-- LEFT JOIN forms f ON u.id = f.user_id
-- GROUP BY u.id, u.name;
