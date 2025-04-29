# Database Migrations System

This directory contains files related to the database migration system for the DAI Off application.

## Overview

The database migrations have been extracted from the route files and centralized in a more organized structure. This approach offers several benefits:

1. **Centralized SQL Queries**: All SQL queries are now stored in one place, making them easier to maintain and update.
2. **Separation of Concerns**: Route files now focus on handling requests and responses, while database operations are handled by dedicated utility functions.
3. **Code Reusability**: Common database operations can be reused across different routes.
4. **Easier Debugging**: When database issues occur, it's easier to identify and fix the problem in a centralized location.

## Files

### migrations.ts

This file contains all the SQL queries used in the application, organized by feature:

- `absencesMigrations`: SQL queries for managing user absences
- `timesheetMigrations`: SQL queries for the timesheet system
- `capacitacionMigrations`: SQL queries for the training courses
- `authMigrations`: SQL queries for user authentication
- `dbInitMigrations`: SQL queries for initializing the database schema

### db-operations.ts

This file provides utility functions that use the SQL queries defined in `migrations.ts`. These functions handle the execution of the queries and processing of the results. The functions are organized by feature:

- `absencesOperations`: Functions for managing user absences
- `timesheetOperations`: Functions for the timesheet system
- `capacitacionOperations`: Functions for the training courses
- `authOperations`: Functions for user authentication

## Usage

To perform database operations in route files, import the appropriate functions from `db-operations.ts` and use them instead of directly executing SQL queries. For example:

```typescript
// Before
const result = await client.execute({
  sql: 'SELECT * FROM user_absences WHERE user_id = ? ORDER BY start_date DESC',
  args: [userId]
});

// After
const absences = await absencesOperations.getUserAbsences(requestEvent, userId);
```

## Benefits of This Approach

1. **Maintainability**: When you need to modify a SQL query, you only need to change it in one place.
2. **Consistency**: The same SQL query is used everywhere it's needed, ensuring consistent behavior.
3. **Type Safety**: The utility functions provide better type checking and error handling.
4. **Testing**: It's easier to test database operations in isolation.
5. **Documentation**: The SQL queries are documented in a central location, making it easier to understand the database schema.

## Future Improvements

1. **Versioned Migrations**: Implement a versioning system for database migrations to track changes over time.
2. **Migration Runner**: Create a utility to run migrations in a specific order.
3. **Rollback Support**: Add support for rolling back migrations if they fail.
4. **Schema Validation**: Add validation to ensure the database schema matches the expected structure.