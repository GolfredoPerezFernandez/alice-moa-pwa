import type { RequestEventBase } from "@builder.io/qwik-city";
import { tursoClient } from "./turso";
import fs from 'fs';
import path from 'path';

/**
 * Runs the authentication schema SQL script to initialize the database tables
 * @param requestEvent The Qwik City request event
 */
export async function initAuthDatabase(requestEvent: RequestEventBase): Promise<{ success: boolean, message: string }> {
  console.log('[DB-INIT] Starting database initialization');
  const client = tursoClient(requestEvent);
  
  try {
    // Use a hardcoded schema to avoid file system issues
    console.log('[DB-INIT] Using hardcoded and file-based schemas');
    
    // Define the base schema directly in the code
    let schemaSql = `
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
    `;

    // Read and append the scraper schema
    try {
      const scraperSchemaPath = path.join(process.cwd(), 'db', 'scraper-schema.sql');
      const scraperSchemaSql = fs.readFileSync(scraperSchemaPath, 'utf-8');
      schemaSql += `\n\n${scraperSchemaSql}`;
      console.log('[DB-INIT] Successfully read and appended scraper-schema.sql');
    } catch (fileError) {
      console.error('[DB-INIT] Error reading scraper-schema.sql:', fileError);
      // Decide if this should be a fatal error or if initialization can continue
      // For now, let's make it fatal to ensure all schemas are applied
      return {
        success: false,
        message: `Failed to read scraper-schema.sql: ${fileError instanceof Error ? fileError.message : String(fileError)}`
      };
    }
    
    // Split the SQL into separate statements and execute them
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      // Filter out empty statements and statements that are only comments
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`[DB-INIT] Executing ${statements.length} filtered SQL statements`);
    
    for (const stmt of statements) {
      await client.execute(stmt);
    }
    
    // Verify the tables were created
    // Verify tables were created
    const tablesResult = await client.batch([
      "SELECT name FROM sqlite_master WHERE type='table' AND name='users'",
      "SELECT name FROM sqlite_master WHERE type='table' AND name='chat_history'",
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user_absences'",
      "SELECT name FROM sqlite_master WHERE type='table' AND name='user_timesheet'",
      "SELECT name FROM sqlite_master WHERE type='table' AND name='cursos_capacitacion'",
      "SELECT name FROM sqlite_master WHERE type='table' AND name='modulos_curso'",
      "SELECT name FROM sqlite_master WHERE type='table' AND name='recursos_curso'",
      "SELECT name FROM sqlite_master WHERE type='table' AND name='progreso_curso'",
      "SELECT name FROM sqlite_master WHERE type='table' AND name='legalDocument'" // Verify legalDocument table
    ], 'read');
    
    // Check if all results have rows indicating the tables exist
    const allTablesExist = tablesResult.every(result => result.rows.length > 0);

    if (tablesResult.length < 9) { // Expected 8 original + 1 new = 9
        console.error('[DB-INIT] Verification failed: Not all table checks were processed. Expected 9, got ' + tablesResult.length);
        // This indicates an issue with the batch execution or the queries themselves.
    }
    
    if (!allTablesExist) {
      console.error('[DB-INIT] Verification failed: one or more required tables not found.');
      return {
        success: false,
        message: 'One or more required tables were not created successfully'
      };
    }

    // Migration: Check and add pdfUrl column to legalDocument if it doesn't exist
    try {
      const tableInfoResult = await client.execute("PRAGMA table_info(legalDocument);");
      const columns = tableInfoResult.rows.map((row: any) => row.name);
      if (!columns.includes('pdfUrl')) {
        console.log('[DB-INIT-MIGRATE] Column "pdfUrl" not found in "legalDocument". Adding it...');
        await client.execute("ALTER TABLE legalDocument ADD COLUMN pdfUrl TEXT;");
        console.log('[DB-INIT-MIGRATE] Successfully added "pdfUrl" column to "legalDocument".');
      } else {
        console.log('[DB-INIT-MIGRATE] Column "pdfUrl" already exists in "legalDocument".');
      }
    } catch (migrationError) {
      console.error('[DB-INIT-MIGRATE] Error during legalDocument migration for pdfUrl:', migrationError);
      // Depending on the error, you might want to return failure or log and continue
      // For now, log and continue, as the main table creation might have succeeded.
    }
    
    console.log('[DB-INIT] Database initialized successfully');
    return {
      success: true,
      message: 'Database tables initialized successfully (including scraper schema and migrations)'
    };
  } catch (error) {
    console.error('[DB-INIT] Error initializing database:', error);
    return {
      success: false,
      message: `Database initialization failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Check if the database connection is working properly
 * @param requestEvent The Qwik City request event
 */
export async function checkDatabaseConnection(requestEvent: RequestEventBase): Promise<{ connected: boolean, message: string }> {
  console.log('[DB-CHECK] Checking database connection');
  const client = tursoClient(requestEvent);
  
  try {
    // Simple query to test the connection
    const result = await client.execute('SELECT 1 as test');
    
    if (result.rows && result.rows.length > 0) {
      console.log('[DB-CHECK] Database connection successful');
      return {
        connected: true,
        message: 'Database connection successful'
      };
    } else {
      console.error('[DB-CHECK] Database connection failed: No rows returned');
      return {
        connected: false,
        message: 'Database connection test failed: No rows returned'
      };
    }
  } catch (error) {
    console.error('[DB-CHECK] Database connection error:', error);
    return {
      connected: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Helper function to create a test user for development purposes
 * @param requestEvent The Qwik City request event
 */
export async function createTestUser(requestEvent: RequestEventBase): Promise<{ success: boolean, message: string }> {
  console.log('[DB-TEST] Creating test user for development');
  const client = tursoClient(requestEvent);
  
  try {
    // Check if test user already exists
    const checkResult = await client.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: ['test@example.com']
    });
    
    if (checkResult.rows.length > 0) {
      console.log('[DB-TEST] Test user already exists');
      return { success: true, message: 'Test user already exists' };
    }
    
    // Import hashPassword function
    const { hashPassword } = await import('./auth');
    
    // Hash a simple password
    const passwordHash = await hashPassword('password123');
    
    // Create the test user
    await client.execute({
      sql: 'INSERT INTO users (email, password_hash, type, name) VALUES (?, ?, ?, ?)',
      args: ['test@example.com', passwordHash, 'admin', 'Test User']
    });
    
    console.log('[DB-TEST] Test user created successfully');
    return { success: true, message: 'Test user created successfully' };
  } catch (error) {
    console.error('[DB-TEST] Error creating test user:', error);
    return {
      success: false,
      message: `Failed to create test user: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}