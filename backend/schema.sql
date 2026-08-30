CREATE DATABASE IF NOT EXISTS smartfin;
USE smartfin;
-- =====================================================
-- USERS
-- =====================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'lecturer') NOT NULL DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- =====================================================
-- MATERIALS
-- =====================================================
CREATE TABLE materials (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    scope TEXT NULL,
    description TEXT NULL,
    theme_image_url VARCHAR(1000) NULL,
    chapter_order INT UNSIGNED NOT NULL DEFAULT 1,
    created_by INT UNSIGNED NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_materials_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_materials_order (chapter_order),
    INDEX idx_materials_published (is_published)
);
-- =====================================================
-- MATERIAL FILES
-- PDF / DOCX
-- =====================================================
CREATE TABLE material_files (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    material_id INT UNSIGNED NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type ENUM('pdf', 'docx') NOT NULL,
    file_size BIGINT UNSIGNED NULL,
    extracted_text LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_material_files_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_material_files_material (material_id)
);
-- =====================================================
-- MATERIAL VIDEOS
-- Hybrid:
-- youtube
-- url
-- upload
-- =====================================================
CREATE TABLE material_videos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    material_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NULL,
    video_type ENUM('youtube', 'url', 'upload') NOT NULL,
    video_url VARCHAR(1000) NULL,
    original_name VARCHAR(255) NULL,
    stored_name VARCHAR(255) NULL,
    file_path VARCHAR(500) NULL,
    duration_seconds INT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_material_videos_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_material_videos_material (material_id)
);
-- =====================================================
-- EXERCISES
-- Latihan yang dimiliki oleh suatu materi
-- =====================================================
CREATE TABLE exercises (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    material_id INT UNSIGNED NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    question_count INT UNSIGNED NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_exercises_material FOREIGN KEY (material_id) REFERENCES materials(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_exercises_material (material_id)
);
-- =====================================================
-- QUESTIONS
-- Soal pilihan ganda hasil parsing file
-- =====================================================
CREATE TABLE questions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exercise_id INT UNSIGNED NOT NULL,
    question_number INT UNSIGNED NOT NULL,
    question_text TEXT NOT NULL,
    explanation TEXT NULL,
    correct_option CHAR(1) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_questions_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_question_number (
        exercise_id,
        question_number
    ),
    INDEX idx_questions_exercise (exercise_id)
);
-- =====================================================
-- QUESTION OPTIONS
-- Pilihan A, B, C, D
-- =====================================================
CREATE TABLE question_options (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    question_id INT UNSIGNED NOT NULL,
    option_key CHAR(1) NOT NULL,
    option_text TEXT NOT NULL,
    CONSTRAINT fk_question_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_question_option (question_id, option_key)
);
-- =====================================================
-- EXERCISE ATTEMPTS
-- Riwayat pengerjaan mahasiswa
-- =====================================================
CREATE TABLE exercise_attempts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exercise_id INT UNSIGNED NOT NULL,
    student_id INT UNSIGNED NOT NULL,
    total_questions INT UNSIGNED NOT NULL DEFAULT 0,
    correct_answers INT UNSIGNED NOT NULL DEFAULT 0,
    wrong_answers INT UNSIGNED NOT NULL DEFAULT 0,
    score DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    CONSTRAINT fk_attempts_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_attempts_student FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_attempts_student (student_id),
    INDEX idx_attempts_exercise (exercise_id)
);
-- =====================================================
-- EXERCISE ANSWERS
-- Jawaban mahasiswa untuk setiap soal
-- =====================================================
CREATE TABLE exercise_answers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT UNSIGNED NOT NULL,
    question_id INT UNSIGNED NOT NULL,
    selected_option CHAR(1) NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_answers_attempt FOREIGN KEY (attempt_id) REFERENCES exercise_attempts(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY uq_attempt_question (attempt_id, question_id)
);
