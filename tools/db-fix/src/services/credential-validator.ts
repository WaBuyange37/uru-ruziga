import { Client } from 'pg';
import { DatabaseConfig, CredentialResult } from '../types/index.js';

export class CredentialValidator {
  async validateCredentials(config: DatabaseConfig): Promise<CredentialResult> {
    const result: CredentialResult = {
      valid: false,
      permissions: [],
      error: undefined
    };

    try {
      // Test with direct URL first (more reliable for permission checks)
      const connectionString = config.directUrl || config.databaseUrl;
      
      if (!connectionString) {
        result.error = 'No valid connection string available';
        return result;
      }

      const client = new Client({ connectionString });
      
      try {
        await client.connect();
        
        // Test basic authentication
        await client.query('SELECT current_user, current_database()');
        result.valid = true;

        // Check permissions
        result.permissions = await this.checkPermissions(client);

      } catch (error) {
        result.error = `Authentication failed: ${error}`;
        result.valid = false;
      } finally {
        try {
          await client.end();
        } catch {
          // Ignore cleanup errors
        }
      }

    } catch (error) {
      result.error = `Credential validation failed: ${error}`;
    }

    return result;
  }

  private async checkPermissions(client: Client): Promise<string[]> {
    const permissions: string[] = [];

    try {
      // Check if user can create tables
      await client.query(`
        SELECT has_schema_privilege(current_user, 'public', 'CREATE') as can_create_schema
      `);
      permissions.push('CREATE_SCHEMA');

      // Check if user can create tables
      const createTableResult = await client.query(`
        SELECT has_schema_privilege(current_user, 'public', 'USAGE') as can_use_schema
      `);
      if (createTableResult.rows[0]?.can_use_schema) {
        permissions.push('USE_SCHEMA');
      }

      // Check if user is superuser
      const superuserResult = await client.query(`
        SELECT usesuper FROM pg_user WHERE usename = current_user
      `);
      if (superuserResult.rows[0]?.usesuper) {
        permissions.push('SUPERUSER');
      }

      // Check if user can create databases
      const createDbResult = await client.query(`
        SELECT usecreatedb FROM pg_user WHERE usename = current_user
      `);
      if (createDbResult.rows[0]?.usecreatedb) {
        permissions.push('CREATE_DATABASE');
      }

      // Check table-level permissions on existing tables
      const tablePermResult = await client.query(`
        SELECT 
          has_table_privilege(current_user, 'information_schema.tables', 'SELECT') as can_select,
          has_table_privilege(current_user, 'information_schema.tables', 'INSERT') as can_insert,
          has_table_privilege(current_user, 'information_schema.tables', 'UPDATE') as can_update,
          has_table_privilege(current_user, 'information_schema.tables', 'DELETE') as can_delete
      `);
      
      const tablePerms = tablePermResult.rows[0];
      if (tablePerms?.can_select) permissions.push('SELECT');
      if (tablePerms?.can_insert) permissions.push('INSERT');
      if (tablePerms?.can_update) permissions.push('UPDATE');
      if (tablePerms?.can_delete) permissions.push('DELETE');

    } catch (error) {
      // If permission checks fail, we still have basic connection
      permissions.push('BASIC_CONNECTION');
    }

    return permissions;
  }

  async testSpecificPermissions(config: DatabaseConfig, requiredPermissions: string[]): Promise<{
    hasAllPermissions: boolean;
    missingPermissions: string[];
    grantedPermissions: string[];
  }> {
    const credentialResult = await this.validateCredentials(config);
    
    if (!credentialResult.valid) {
      return {
        hasAllPermissions: false,
        missingPermissions: requiredPermissions,
        grantedPermissions: []
      };
    }

    const grantedPermissions = credentialResult.permissions;
    const missingPermissions = requiredPermissions.filter(
      perm => !grantedPermissions.includes(perm)
    );

    return {
      hasAllPermissions: missingPermissions.length === 0,
      missingPermissions,
      grantedPermissions
    };
  }

  async validateSupabaseCredentials(config: DatabaseConfig): Promise<{
    databaseValid: boolean;
    supabaseValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    let databaseValid = false;
    let supabaseValid = false;

    // Test database credentials
    try {
      const dbResult = await this.validateCredentials(config);
      databaseValid = dbResult.valid;
      if (!databaseValid && dbResult.error) {
        errors.push(`Database: ${dbResult.error}`);
      }
    } catch (error) {
      errors.push(`Database validation error: ${error}`);
    }

    // Test Supabase API credentials
    try {
      if (config.supabaseUrl && config.supabaseAnonKey) {
        const response = await fetch(`${config.supabaseUrl}/rest/v1/`, {
          headers: {
            'apikey': config.supabaseAnonKey,
            'Authorization': `Bearer ${config.supabaseAnonKey}`
          }
        });
        
        supabaseValid = response.status === 200 || response.status === 404; // 404 is OK, means API is working
        
        if (!supabaseValid) {
          errors.push(`Supabase API returned status: ${response.status}`);
        }
      } else {
        errors.push('Supabase URL or API key is missing');
      }
    } catch (error) {
      errors.push(`Supabase API validation error: ${error}`);
    }

    return { databaseValid, supabaseValid, errors };
  }
}