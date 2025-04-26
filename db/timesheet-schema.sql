-- User Timesheet Table for Check-in/Check-out Records
CREATE TABLE IF NOT EXISTS user_timesheet (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    check_in_time TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP,
    check_in_location TEXT, -- JSON string with latitude and longitude for check-in
    check_out_location TEXT, -- JSON string with latitude and longitude for check-out
    total_minutes INTEGER, -- Will be calculated upon check-out
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_timesheet_user_id ON user_timesheet(user_id);
CREATE INDEX IF NOT EXISTS idx_timesheet_date ON user_timesheet(check_in_time);