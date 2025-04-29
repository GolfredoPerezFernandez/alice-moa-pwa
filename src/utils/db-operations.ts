/**
 * This file contains utility functions to execute database operations
 * using the migrations defined in migrations.ts
 */

import type { RequestEventBase } from "@builder.io/qwik-city";
import { tursoClient } from "./turso";
import { 
  absencesMigrations, 
  timesheetMigrations, 
  capacitacionMigrations, 
  authMigrations 
} from "./migrations";

// Absences operations
export const absencesOperations = {
  /**
   * Get all absences for a user
   */
  getUserAbsences: async (requestEvent: RequestEventBase, userId: string) => {
    const client = tursoClient(requestEvent);
    const result = await client.execute({
      sql: absencesMigrations.getUserAbsences,
      args: [userId]
    });
    return result.rows;
  },

  /**
   * Register a new absence
   */
  registerAbsence: async (
    requestEvent: RequestEventBase,
    userId: string,
    startDate: any,
    endDate: any,
    absenceType: any,
    description: any = ''
  ) => {
    const client = tursoClient(requestEvent);
    await client.execute({
      sql: absencesMigrations.registerAbsence,
      args: [userId, startDate, endDate, absenceType, description]
    });
    return { success: true, message: 'Ausencia registrada correctamente' };
  },

  /**
   * Delete an absence
   */
  deleteAbsence: async (requestEvent: RequestEventBase, absenceId: any, userId: string) => {
    const client = tursoClient(requestEvent);
    await client.execute({
      sql: absencesMigrations.deleteAbsence,
      args: [absenceId, userId]
    });
    return { success: true, message: 'Ausencia eliminada correctamente' };
  }
};

// Timesheet operations
export const timesheetOperations = {
  /**
   * Get timesheet data for a user
   */
  getTimesheetData: async (requestEvent: RequestEventBase, userId: string) => {
    if (!userId) {
      return { timesheet: [], isCheckedIn: false, currentEntry: null };
    }

    const client = tursoClient(requestEvent);
    
    // Check if user is checked in
    const currentEntryResult = await client.execute({
      sql: timesheetMigrations.getCurrentEntry,
      args: [userId]
    });

    const isCheckedIn = currentEntryResult.rows.length > 0;
    const currentEntry = isCheckedIn ? currentEntryResult.rows[0] : null;

    // Get timesheet history
    const historyResult = await client.execute({
      sql: timesheetMigrations.getTimesheetHistory,
      args: [userId]
    });

    return {
      timesheet: historyResult.rows,
      isCheckedIn,
      currentEntry
    };
  },

  /**
   * Check in a user
   */
  checkIn: async (requestEvent: RequestEventBase, userId: string, location: string | null) => {
    const client = tursoClient(requestEvent);
    
    // Check if user already has an active entry
    const checkResult = await client.execute({
      sql: timesheetMigrations.checkActiveEntry,
      args: [userId]
    });

    if (checkResult.rows.length > 0) {
      return { 
        success: false, 
        message: 'Ya tienes una entrada activa. Debes fichar salida primero.' 
      };
    }

    // Create new entry
    await client.execute({
      sql: timesheetMigrations.createCheckIn,
      args: [userId, location]
    });

    return { 
      success: true, 
      message: 'Entrada fichada correctamente',
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Check out a user
   */
  checkOut: async (requestEvent: RequestEventBase, userId: string, location: string | null) => {
    const client = tursoClient(requestEvent);
    
    // Find active entry
    const entryResult = await client.execute({
      sql: timesheetMigrations.getActiveEntry,
      args: [userId]
    });

    if (entryResult.rows.length === 0) {
      return { 
        success: false, 
        message: 'No tienes una entrada activa para fichar salida.' 
      };
    }

    const entryId = entryResult.rows[0].id;
    const checkInTimeStr = String(entryResult.rows[0].check_in_time);
    const checkInTime = new Date(checkInTimeStr);
    const checkOutTime = new Date();
    
    // Calculate minutes worked
    const totalMinutes = Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000);

    // Update entry with checkout info
    await client.execute({
      sql: timesheetMigrations.updateCheckOut,
      args: [location, totalMinutes, entryId]
    });

    return { 
      success: true, 
      message: 'Salida fichada correctamente',
      timestamp: checkOutTime.toISOString(),
      totalMinutes
    };
  }
};

// Capacitacion operations
export const capacitacionOperations = {
  /**
   * Get all courses
   */
  getAllCourses: async (requestEvent: RequestEventBase) => {
    try {
      const client = tursoClient(requestEvent);
      const result = await client.execute(capacitacionMigrations.getAllCourses);
      
      // Map the results to the correct type
      return result.rows.map(row => ({
        id: Number(row.id),
        titulo: String(row.titulo),
        descripcion: String(row.descripcion),
        categoria: String(row.categoria) as 'seguridad' | 'derechos' | 'prevencion' | 'igualdad' | 'salud',
        imagen_color: String(row.imagen_color || 'bg-red-100 dark:bg-red-900/20'),
        instructor: row.instructor ? String(row.instructor) : undefined,
        duracion: row.duracion ? String(row.duracion) : undefined
      }));
    } catch (error) {
      console.error('[CAPACITACION] Error al cargar cursos:', error);
      return [];
    }
  }
};

// Auth operations
export const authOperations = {
  /**
   * Check if an email is registered
   */
  checkEmail: async (requestEvent: RequestEventBase, email: string) => {
    const client = tursoClient(requestEvent);
    
    try {
      const result = await client.execute({
        sql: authMigrations.checkEmail,
        args: [email]
      });

      return {
        success: true,
        isRegistered: result.rows.length > 0
      };
    } catch (error) {
      console.error('Email check error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to check email';
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Register a new user
   */
  registerUser: async (
    requestEvent: RequestEventBase, 
    email: string, 
    passwordHash: string, 
    userType: 'trabajador' | 'despacho' | 'sindicato',
    fullName?: string
  ) => {
    const client = tursoClient(requestEvent);
    
    try {
      // Insert user with or without name
      const sql = fullName
        ? authMigrations.insertUserWithName
        : authMigrations.insertUserWithoutName;
      
      const args = fullName 
        ? [email, passwordHash, userType, fullName.trim()] 
        : [email, passwordHash, userType];

      const result = await client.execute({ sql, args });
      
      return { 
        success: true, 
        userId: result.lastInsertRowid 
      };
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Login a user
   */
  loginUser: async (requestEvent: RequestEventBase, email: string) => {
    const client = tursoClient(requestEvent);
    
    try {
      const result = await client.execute({
        sql: authMigrations.getUserByEmail,
        args: [email]
      });
      
      if (result.rows.length === 0) {
        return { success: false, error: 'User not found' };
      }
      
      const user = result.rows[0];
      
      // Update session expiration
      await client.execute({
        sql: authMigrations.updateSessionExpires,
        args: [new Date(Date.now() + 24 * 60 * 60 * 1000), String(user.id)]
      });
      
      return { 
        success: true, 
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }
};

// Export all operations
export const dbOperations = {
  absences: absencesOperations,
  timesheet: timesheetOperations,
  capacitacion: capacitacionOperations,
  auth: authOperations
};