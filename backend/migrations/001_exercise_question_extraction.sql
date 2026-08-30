-- Jalankan sekali pada database yang sudah ada.
-- Parser tidak dapat menentukan jawaban benar dari dokumen tanpa format kunci jawaban,
-- sehingga kolom ini harus boleh kosong saat soal pertama kali diekstraksi.
ALTER TABLE questions
    MODIFY correct_option CHAR(1) NULL;

CREATE TABLE IF NOT EXISTS exercise_documents (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    exercise_id INT UNSIGNED NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_type ENUM('pdf', 'docx') NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT UNSIGNED NULL,
    extracted_text LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_exercise_documents_exercise
        FOREIGN KEY (exercise_id) REFERENCES exercises(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_exercise_documents_exercise (exercise_id)
);
