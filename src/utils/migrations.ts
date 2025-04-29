/**
 * This file contains all database migrations that were previously in route files.
 * It serves as a backup and reference for SQL queries used in the application.
 */

// Absences migrations
export const absencesMigrations = {
  // Get user absences
  getUserAbsences: `
    SELECT * FROM user_absences 
    WHERE user_id = ? 
    ORDER BY start_date DESC
  `,
  
  // Register a new absence
  registerAbsence: `
    INSERT INTO user_absences (user_id, start_date, end_date, absence_type, description)
    VALUES (?, ?, ?, ?, ?)
  `,
  
  // Delete an absence
  deleteAbsence: `
    DELETE FROM user_absences 
    WHERE id = ? AND user_id = ?
  `
};

// Timesheet migrations
export const timesheetMigrations = {
  // Get current entry (check if user is checked in)
  getCurrentEntry: `
    SELECT * FROM user_timesheet 
    WHERE user_id = ? AND check_out_time IS NULL 
    ORDER BY check_in_time DESC LIMIT 1
  `,
  
  // Get timesheet history
  getTimesheetHistory: `
    SELECT * FROM user_timesheet 
    WHERE user_id = ? 
    ORDER BY check_in_time DESC LIMIT 10
  `,
  
  // Check if user already has an active entry
  checkActiveEntry: `
    SELECT id FROM user_timesheet 
    WHERE user_id = ? AND check_out_time IS NULL
  `,
  
  // Create a new check-in entry
  createCheckIn: `
    INSERT INTO user_timesheet 
    (user_id, check_in_time, check_in_location) 
    VALUES (?, CURRENT_TIMESTAMP, ?)
  `,
  
  // Get active entry for check-out
  getActiveEntry: `
    SELECT id, check_in_time FROM user_timesheet 
    WHERE user_id = ? AND check_out_time IS NULL 
    ORDER BY check_in_time DESC LIMIT 1
  `,
  
  // Update entry with check-out information
  updateCheckOut: `
    UPDATE user_timesheet 
    SET check_out_time = CURRENT_TIMESTAMP, 
        check_out_location = ?, 
        total_minutes = ? 
    WHERE id = ?
  `
};

// Capacitacion migrations
export const capacitacionMigrations = {
  // Get all courses
  getAllCourses: `
    SELECT id, titulo, descripcion, categoria, instructor, duracion, imagen_color
    FROM cursos_capacitacion
    ORDER BY fecha_creacion DESC
  `
};

// Auth migrations
export const authMigrations = {
  // Check if email exists
  checkEmail: `
    SELECT id FROM users WHERE email = ?
  `,
  
  // Insert new user with name
  insertUserWithName: `
    INSERT INTO users (email, password_hash, type, name) VALUES (?, ?, ?, ?)
  `,
  
  // Insert new user without name
  insertUserWithoutName: `
    INSERT INTO users (email, password_hash, type) VALUES (?, ?, ?)
  `,
  
  // Get user by email
  getUserByEmail: `
    SELECT * FROM users WHERE email = ?
  `,
  
  // Update session expiration
  updateSessionExpires: `
    UPDATE users SET session_expires = ? WHERE id = ?
  `
};

// Database initialization migrations
export const dbInitMigrations = {
  // Auth schema
  authSchema: `
    -- Users Table for Authentication
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        type TEXT DEFAULT 'trabajador' CHECK (type IN ('trabajador', 'despacho', 'sindicato')),
        name TEXT,
        session_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);

    -- Chat History Table
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')), -- Who sent the message
        content TEXT NOT NULL, -- The message text
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE -- Link to users table
    );

    -- Index for faster history retrieval per user
    CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
    
    -- Contract Details Table
    CREATE TABLE IF NOT EXISTS contract_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        community TEXT NOT NULL, -- Comunidad
        province TEXT NOT NULL, -- Provincia
        profession TEXT NOT NULL, -- Profesión
        contract_start_date DATE NOT NULL, -- Fecha de inicio del contrato
        contract_end_date DATE, -- Fecha de finalización del contrato (puede ser NULL para contratos indefinidos)
        contract_type TEXT NOT NULL, -- Tipo de contrato (Indefinido, Temporal, etc.)
        probation_period TEXT NOT NULL, -- Periodo de prueba (Sí, No)
        work_schedule_type TEXT NOT NULL, -- Tipo de jornada (Completa, Parcial, etc.)
        weekly_hours INTEGER, -- Horas semanales
        net_salary DECIMAL(10, 2), -- Salario Neto
        gross_salary DECIMAL(10, 2), -- Salario Bruto
        extra_payments TEXT, -- Pagas Extras
        sector TEXT, -- Sector / Sindicato
        contribution_group TEXT, -- Grupo de Cotización
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Create index for better performance
    CREATE INDEX IF NOT EXISTS idx_contract_details_user_id ON contract_details(user_id);

    -- User Absences Table (Registro de ausencias laborales)
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

    -- Tabla para los cursos de capacitación
    CREATE TABLE IF NOT EXISTS cursos_capacitacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT NOT NULL,
        descripcion_completa TEXT,
        categoria TEXT CHECK (categoria IN ('seguridad', 'derechos', 'prevencion', 'igualdad', 'salud')),
        instructor TEXT,
        duracion TEXT,
        imagen_color TEXT DEFAULT 'bg-red-100 dark:bg-red-900/20',
        creado_por INTEGER NOT NULL,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creado_por) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tabla para los módulos de los cursos
    CREATE TABLE IF NOT EXISTS modulos_curso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        curso_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        tipo TEXT CHECK (tipo IN ('video', 'document', 'quiz', 'interactive')),
        orden INTEGER NOT NULL,
        url_contenido TEXT,
        FOREIGN KEY (curso_id) REFERENCES cursos_capacitacion(id) ON DELETE CASCADE
    );

    -- Tabla para los recursos descargables de los cursos
    CREATE TABLE IF NOT EXISTS recursos_curso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        curso_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        tipo TEXT CHECK (tipo IN ('pdf', 'excel', 'image', 'document', 'video')),
        url_recurso TEXT,
        FOREIGN KEY (curso_id) REFERENCES cursos_capacitacion(id) ON DELETE CASCADE
    );

    -- Tabla para el progreso de los usuarios en los cursos
    CREATE TABLE IF NOT EXISTS progreso_curso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        modulo_id INTEGER NOT NULL,
        completado BOOLEAN DEFAULT FALSE,
        fecha_completado TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (modulo_id) REFERENCES modulos_curso(id) ON DELETE CASCADE,
        UNIQUE(usuario_id, modulo_id)
    );

    -- Índices para mejorar el rendimiento
    CREATE INDEX IF NOT EXISTS idx_cursos_categoria ON cursos_capacitacion(categoria);
    CREATE INDEX IF NOT EXISTS idx_cursos_creador ON cursos_capacitacion(creado_por);
    CREATE INDEX IF NOT EXISTS idx_modulos_curso ON modulos_curso(curso_id);
    CREATE INDEX IF NOT EXISTS idx_recursos_curso ON recursos_curso(curso_id);
    CREATE INDEX IF NOT EXISTS idx_progreso_usuario ON progreso_curso(usuario_id);
    CREATE INDEX IF NOT EXISTS idx_progreso_modulo ON progreso_curso(modulo_id);
  `,
  
  // Check database connection
  checkConnection: `SELECT 1 as test`,
  
  // Verify tables exist
  verifyTables: [
    "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
    "SELECT name FROM sqlite_master WHERE type='table' AND name='chat_history'",
    "SELECT name FROM sqlite_master WHERE type='table' AND name='user_absences'",
    "SELECT name FROM sqlite_master WHERE type='table' AND name='user_timesheet'",
    "SELECT name FROM sqlite_master WHERE type='table' AND name='cursos_capacitacion'",
    "SELECT name FROM sqlite_master WHERE type='table' AND name='modulos_curso'",
    "SELECT name FROM sqlite_master WHERE type='table' AND name='recursos_curso'",
    "SELECT name FROM sqlite_master WHERE type='table' AND name='progreso_curso'"
  ],
  
  // Create test user
  createTestUser: `
    INSERT INTO users (email, password_hash, type, name) VALUES (?, ?, ?, ?)
  `
};

// Export all migrations
export const allMigrations = {
  absences: absencesMigrations,
  timesheet: timesheetMigrations,
  capacitacion: capacitacionMigrations,
  auth: authMigrations,
  dbInit: dbInitMigrations
};