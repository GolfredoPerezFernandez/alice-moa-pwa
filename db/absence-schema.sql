-- User Absences Table
CREATE TABLE IF NOT EXISTS user_absences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    absence_type TEXT NOT NULL CHECK (absence_type IN ('illness', 'vacation', 'personal', 'other')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_absences_user_id ON user_absences(user_id);
CREATE INDEX IF NOT EXISTS idx_absences_date_range ON user_absences(start_date, end_date);