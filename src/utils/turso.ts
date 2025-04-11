import type { RequestEventBase } from "@builder.io/qwik-city";
import { createClient, type Client, type InStatement, type ResultSet } from "@libsql/client";

export function tursoClient(requestEvent: RequestEventBase): Client {
  try {
    console.log('[TURSO] Creating database client');
    
    // Get database URL from environment
    const url = requestEvent.env.get("PRIVATE_TURSO_DATABASE_URL")?.trim();
    if (!url) {
      console.error('[TURSO] Missing database URL');
      throw new Error("PRIVATE_TURSO_DATABASE_URL is not defined");
    }
    
    // Get auth token from environment
    const authToken = requestEvent.env.get("PRIVATE_TURSO_AUTH_TOKEN")?.trim();
    if (!authToken) {
      if (!url.includes("file:")) {
        console.error('[TURSO] Missing auth token for remote database');
        throw new Error("PRIVATE_TURSO_AUTH_TOKEN is not defined");
      }
      console.log('[TURSO] No auth token needed for local database');
    }
    
    console.log(`[TURSO] Creating client for URL: ${url.substring(0, 20)}...`);
    return createClient({
      url,
      authToken,
    });
  } catch (error) {
    console.error('[TURSO] Error creating database client:', error);
    throw error;
  }
}

/**
 * Executes a SQL query using the Turso client derived from the request event.
 * @param requestEvent The Qwik City request event.
 * @param sql The SQL query string.
 * @param params Optional parameters for the SQL query.
 * @returns The result set from the query execution.
 */
export async function executeQuery(
  requestEvent: RequestEventBase,
  sql: InStatement,
  params?: any[] // Keep params optional and flexible for now
): Promise<ResultSet> {
  console.log(`[TURSO-QUERY] Executing SQL: ${typeof sql === 'string' ? sql.substring(0, 50) : 'complex query'}`);
  
  const client = tursoClient(requestEvent);
  
  try {
    let result: ResultSet;
    
    // Adapt the execute call based on whether params are provided
    if (params && params.length > 0) {
      console.log(`[TURSO-QUERY] With parameters: ${JSON.stringify(params)}`);
      result = await client.execute({ sql: sql as string, args: params });
    } else {
      result = await client.execute(sql);
    }
    
    console.log(`[TURSO-QUERY] Query successful, returned ${result.rows.length} rows`);
    return result;
  } catch (error) {
    console.error("[TURSO-QUERY] Error executing query:",
                 typeof sql === 'string' ? sql.substring(0, 100) : 'complex query',
                 params,
                 error);
    
    // Add more context to the error
    const enhancedError = new Error(
      `Database query failed: ${error instanceof Error ? error.message : String(error)}`
    );
    
    throw enhancedError; // Re-throw the enhanced error to be handled by the caller
  }
}

/**
 * Tests the database connection and returns basic information
 * @param requestEvent The Qwik City request event
 * @returns Information about the database connection
 */
export async function testDatabaseConnection(requestEvent: RequestEventBase): Promise<{
  success: boolean;
  message: string;
  dbInfo?: any;
}> {
  try {
    console.log('[TURSO-TEST] Testing database connection');
    const client = tursoClient(requestEvent);
    
    // Try a simple query
    const result = await client.execute('SELECT sqlite_version() as version');
    
    if (result.rows && result.rows.length > 0) {
      const dbInfo = {
        version: result.rows[0].version,
        timestamp: new Date().toISOString()
      };
      
      console.log(`[TURSO-TEST] Connection successful: SQLite version ${dbInfo.version}`);
      return {
        success: true,
        message: 'Database connection successful',
        dbInfo
      };
    } else {
      console.error('[TURSO-TEST] Connection failed: No data returned');
      return {
        success: false,
        message: 'Database connection test failed: No data returned'
      };
    }
  } catch (error) {
    console.error('[TURSO-TEST] Connection error:', error);
    return {
      success: false,
      message: `Database connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}
