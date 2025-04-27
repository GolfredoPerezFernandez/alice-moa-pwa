import { RequestEvent, RequestEventBase } from '@builder.io/qwik-city';
import { tursoClient } from './turso';

// Convert string to ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

// Convert ArrayBuffer to hex string
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function hashPassword(password: string): Promise<string> {
  console.log('[AUTH] Hashing password');
  
  // Convert password to ArrayBuffer
  const passwordBuffer = stringToArrayBuffer(password);
  
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Import password as key
  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  // Combine salt and derived key
  const combined = new Uint8Array(salt.length + 32);
  combined.set(salt);
  combined.set(new Uint8Array(derivedKey), salt.length);
  
  // Return as hex string
  const hash = arrayBufferToHex(combined);
  console.log('[AUTH] Password hashed successfully');
  return hash;
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  console.log('[AUTH] Verifying password');
  
  // Convert hex string back to ArrayBuffer
  const combined = new Uint8Array(hash.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
  
  // Extract salt and derived key
  const salt = combined.slice(0, 16);
  const storedKey = combined.slice(16);
  
  // Hash the input password with the same salt
  const passwordBuffer = stringToArrayBuffer(password);
  const key = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  const derivedKey = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );
  
  // Compare the derived key with the stored key
  const isValid = arrayBufferToHex(derivedKey) === arrayBufferToHex(storedKey);
  console.log(`[AUTH] Password verification result: ${isValid}`);
  return isValid;
}

// Helper functions for cookies
export const setCookies = (
  requestEvent: RequestEventBase,
  userId: string | number | bigint,
  userType: 'trabajador' | 'despacho' | 'sindicato'
) => {
  const userIdStr = String(userId);
  
  // Set longer session duration (24 hours in seconds)
  const maxAge = 24 * 60 * 60;
  
  // Set auth token cookie - same-site lax to prevent issues with redirects
  requestEvent.cookie.set('auth_token', userIdStr, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better session persistence
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAge,
  });
  
  // Set user type cookie - same settings for consistency
  requestEvent.cookie.set('user_type', userType, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax', // Changed from 'strict' to 'lax'
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAge,
  });
  
  // Add a client-readable session cookie for UI indication
  requestEvent.cookie.set('session_active', 'true', {
    path: '/',
    httpOnly: false, // Client can read this
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAge,
  });
};

export const clearAuthCookies = (requestEvent: RequestEventBase) => {
  requestEvent.cookie.delete('auth_token', { path: '/' });
  requestEvent.cookie.delete('user_type', { path: '/' });
  requestEvent.cookie.delete('session_active', { path: '/' });
};

export const getUserId = (requestEvent: RequestEventBase): string | null => {
  const user_id = requestEvent.cookie.get('auth_token')?.value;
  console.log(`[AUTH] Retrieved user_id: ${user_id || 'none'}`);
  return user_id || null;
};

export const getUserType = (requestEvent: RequestEventBase): 'trabajador' | 'despacho' | 'sindicato' => {
  const user_type = requestEvent.cookie.get('user_type')?.value;
  if (user_type === 'trabajador' || user_type === 'despacho' || user_type === 'sindicato') return user_type as 'trabajador' | 'despacho' | 'sindicato';
  // Default to 'trabajador' if the type is not recognized or missing
  return 'trabajador';
};

export const isAdmin = (requestEvent: RequestEventBase): boolean => {
  const userType = getUserType(requestEvent);
  return userType === 'sindicato';
};

export const isCoordinator = (requestEvent: RequestEventBase): boolean => {
  const userType = getUserType(requestEvent);
  return userType === 'despacho';
};

// Verifica si el usuario es de tipo "sindicado"
export const isSindicado = async (requestEvent: RequestEventBase): Promise<boolean> => {
  try {
    const user_id = getUserId(requestEvent);
    if (!user_id) return false;
    
    const client = tursoClient(requestEvent);
    const result = await client.execute({
      sql: 'SELECT sector FROM contract_details WHERE user_id = ? AND sector = ?',
      args: [user_id, 'sindicato']
    });
    
    console.log(`[AUTH] Checking sindicado status for user ${user_id}: ${result.rows.length > 0}`);
    return result.rows.length > 0;
  } catch (error) {
    console.error('[AUTH] Error checking sindicado status:', error);
    return false;
  }
};

// Verifica si el usuario es de tipo "despacho"
export const isDespacho = async (requestEvent: RequestEventBase): Promise<boolean> => {
  try {
    const user_id = getUserId(requestEvent);
    if (!user_id) return false;
    
    const client = tursoClient(requestEvent);
    const result = await client.execute({
      sql: 'SELECT sector FROM contract_details WHERE user_id = ? AND sector = ?',
      args: [user_id, 'despacho']
    });
    
    console.log(`[AUTH] Checking despacho status for user ${user_id}: ${result.rows.length > 0}`);
    return result.rows.length > 0;
  } catch (error) {
    console.error('[AUTH] Error checking despacho status:', error);
    return false;
  }
};

// Verifica si el usuario puede crear/gestionar cursos de capacitación
export const canManageCapacitacion = async (requestEvent: RequestEventBase): Promise<boolean> => {
  // Los administradores siempre pueden gestionar cursos
  if (isAdmin(requestEvent)) return true;
  
  // Los usuarios de tipo sindicado o despacho pueden gestionar cursos
  const userIsSindicado = await isSindicado(requestEvent);
  const userIsDespacho = await isDespacho(requestEvent);
  
  return userIsSindicado || userIsDespacho;
};

export const verifyAuth = async (requestEvent: RequestEventBase): Promise<boolean> => {
  console.log('[AUTH] Verifying authentication');
  const user_id = requestEvent.cookie.get('auth_token')?.value;
  console.log(`[AUTH] Found auth_token: ${user_id ? 'yes' : 'no'}`);
  
  if (!user_id) {
    console.log('[AUTH] No auth_token found - user not authenticated');
    return false;
  }
  
  // Get user type from cookie
  const user_type = requestEvent.cookie.get('user_type')?.value as 'trabajador' | 'despacho' | 'sindicato';
  if (!user_type) {
    console.log('[AUTH] No user_type found, using default trabajador');
  }
  
  // Session refresh mechanism - extend session on each verification
  // This ensures the session lasts 24 hours from the last activity, not just login
  const maxAge = 24 * 60 * 60; // 24 hours in seconds
  
  // Refresh auth token cookie
  requestEvent.cookie.set('auth_token', user_id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAge,
  });
  
  // Refresh user type cookie
  requestEvent.cookie.set('user_type', user_type || 'trabajador', {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAge,
  });
  
  // Refresh session active cookie
  requestEvent.cookie.set('session_active', 'true', {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: maxAge,
  });
  
  // Also refresh session_expires in database if needed
  try {
    const client = tursoClient(requestEvent);
    await client.execute({
      sql: 'UPDATE users SET session_expires = ? WHERE id = ?',
      args: [new Date(Date.now() + maxAge * 1000), user_id]
    });
  } catch (error) {
    console.error('[AUTH] Error refreshing session in database:', error);
    // Continue anyway, as we've already refreshed the cookies
  }
  
  console.log('[AUTH] User authenticated successfully and session refreshed');
  return true;
};
