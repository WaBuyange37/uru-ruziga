# Bugfix Requirements Document

## Introduction

The Uruziga authentication and database connection system is experiencing critical failures that prevent users from registering, logging in, and saving their learning progress. The primary symptom is "Authenticated user not found" errors during practice submissions, indicating a disconnect between the authentication layer and database operations. This bug affects both local development and deployed environments, blocking the MVP launch. This document captures the defective behavior, defines the expected correct behavior, and identifies existing functionality that must be preserved during the fix.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a new user attempts to register/sign-up THEN the system fails to create the user in the database or creates the user in an unexpected database location

1.2 WHEN a registered user attempts to login THEN the system fails to retrieve the user from the database or retrieves from a different database than where registration stored the user

1.3 WHEN an authenticated user submits practice writing THEN the system returns "Authenticated user not found" error

1.4 WHEN an authenticated user completes a practice session THEN the system fails to save UserAttempt and progress records to the database

1.5 WHEN a user refreshes the browser after login THEN the system fails to maintain the authenticated session state

1.6 WHEN protected API routes verify JWT tokens THEN the system fails to resolve the logged-in user from the token

1.7 WHEN JWT tokens are created during login THEN the system may use an inconsistent JWT_SECRET between token creation and verification

1.8 WHEN authenticated API calls are made THEN the system fails to correctly send authentication credentials (cookie or Authorization header)

1.9 WHEN cookies are configured for authentication THEN the cookie settings fail to work correctly for both localhost and production domains

1.10 WHEN the local environment points to one database and deployed environment points to another THEN the authentication state is not synchronized

### Expected Behavior (Correct)

2.1 WHEN a new user attempts to register/sign-up THEN the system SHALL create the user record in the configured Supabase database and return success confirmation

2.2 WHEN a registered user attempts to login THEN the system SHALL retrieve the user from the same Supabase database where registration occurred and create a valid JWT token

2.3 WHEN an authenticated user submits practice writing THEN the system SHALL resolve the authenticated user from the JWT token and process the submission without "Authenticated user not found" errors

2.4 WHEN an authenticated user completes a practice session THEN the system SHALL create UserAttempt and progress records in the database associated with the authenticated user's ID

2.5 WHEN a user refreshes the browser after login THEN the system SHALL maintain the authenticated session by reading the valid JWT token from storage (cookie or localStorage)

2.6 WHEN protected API routes verify JWT tokens THEN the system SHALL successfully resolve the logged-in user using the same JWT_SECRET used during token creation

2.7 WHEN JWT tokens are created during login THEN the system SHALL use a consistent JWT_SECRET value from environment variables for both token creation and verification

2.8 WHEN authenticated API calls are made THEN the system SHALL correctly send authentication credentials using either httpOnly cookies with credentials: 'include' or Bearer tokens in the Authorization header

2.9 WHEN cookies are configured for authentication THEN the cookie settings SHALL work correctly for both localhost (secure: false, sameSite: 'lax') and production (secure: true, sameSite: 'strict', domain configured)

2.10 WHEN DATABASE_URL and DIRECT_URL are configured THEN both local and deployed environments SHALL point to the same Supabase database instance to maintain consistent authentication state

2.11 WHEN a guest user attempts to submit practice without authentication THEN the system SHALL display a friendly sign-in message instead of logging console errors or crashing

2.12 WHEN the OCR service is unavailable and practice is submitted THEN the system SHALL use a fallback mechanism to allow progress continuation without blocking on OCR evaluation

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the Prisma schema is consulted THEN the system SHALL CONTINUE TO use the existing schema without modifications

3.2 WHEN database migrations are managed THEN the system SHALL CONTINUE TO use existing migrations without creating new ones

3.3 WHEN the seed script runs THEN the system SHALL CONTINUE TO maintain seed safety constraints and existing seeding logic

3.4 WHEN OCR algorithm processes character recognition THEN the system SHALL CONTINUE TO use the existing OCR algorithm implementation without changes

3.5 WHEN UMWERO_MAP is referenced for character mapping THEN the system SHALL CONTINUE TO use the existing UMWERO_MAP data structure

3.6 WHEN translator logic processes language translation THEN the system SHALL CONTINUE TO use the existing translator implementation

3.7 WHEN Supabase storage operations access files THEN the system SHALL CONTINUE TO use the existing storage architecture and bucket configuration

3.8 WHEN the UI renders components THEN the system SHALL CONTINUE TO use the existing UI design without redesign changes
