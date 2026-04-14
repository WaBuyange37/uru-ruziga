import { Client } from 'pg';
import { DatabaseConfig, SchemaResult } from '../types/index.js';

export class SchemaChecker {
  private expectedTables = [
    'languages', 'characters', 'character_translations', 'stroke_data',
    'cultural_contexts', 'cultural_context_translations', 'context_examples',
    'lessons', 'lesson_translations', 'lesson_steps', 'step_translations',
    'lesson_progress', 'user_attempts', 'achievements', 'user_achievements',
    'users', 'user_character_progress', 'certificates', 'discussions',
    'discussion_likes', 'comments', 'carts', 'cart_items', 'orders',
    'donations', 'user_drawings', 'community_posts', 'post_likes',
    'post_comments', 'chat_messages', 'training_data', 'quizzes',
    'quiz_attempts', 'activity_logs'
  ];

  async checkSchema(config: DatabaseConfig): Promise<SchemaResult> {
    const result: SchemaResult = {
      tablesExist: false,
      migrationsApplied: false,
      missingTables: [],
      error: undefined
    };

    try {
      const connectionString = config.directUrl || config.databaseUrl;
      
      if (!connectionString) {
        result.error = 'No valid connection string available';
        return result;
      }

      const client = new Client({ connectionString });
      
      try {
        await client.connect();
        
        // Check which tables exist
        const existingTables = await this.getExistingTables(client);
        const missingTables = this.expectedTables.filter(
          table => !existingTables.includes(table)
        );

        result.missingTables = missingTables;
        result.tablesExist = missingTables.length === 0;

        // Check if Prisma migrations table exists and has entries
        result.migrationsApplied = await this.checkMigrationsApplied(client);

      } catch (error) {
        result.error = `Schema check failed: ${error}`;
      } finally {
        try {
          await client.end();
        } catch {
          // Ignore cleanup errors
        }
      }

    } catch (error) {
      result.error = `Schema validation failed: ${error}`;
    }

    return result;
  }

  private async getExistingTables(client: Client): Promise<string[]> {
    try {
      const result = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);
      
      return result.rows.map(row => row.tablename);
    } catch (error) {
      throw new Error(`Failed to get existing tables: ${error}`);
    }
  }

  private async checkMigrationsApplied(client: Client): Promise<boolean> {
    try {
      // Check if _prisma_migrations table exists
      const migrationTableResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '_prisma_migrations'
        )
      `);

      if (!migrationTableResult.rows[0]?.exists) {
        return false;
      }

      // Check if there are any applied migrations
      const migrationsResult = await client.query(`
        SELECT COUNT(*) as count 
        FROM _prisma_migrations 
        WHERE finished_at IS NOT NULL
      `);

      return parseInt(migrationsResult.rows[0]?.count || '0') > 0;

    } catch (error) {
      // If we can't check migrations, assume they're not applied
      return false;
    }
  }

  async getDetailedSchemaInfo(config: DatabaseConfig): Promise<{
    tables: Array<{
      name: string;
      exists: boolean;
      rowCount?: number;
      columns?: number;
    }>;
    indexes: Array<{
      name: string;
      table: string;
      exists: boolean;
    }>;
    constraints: Array<{
      name: string;
      table: string;
      type: string;
      exists: boolean;
    }>;
  }> {
    const connectionString = config.directUrl || config.databaseUrl;
    const client = new Client({ connectionString });
    
    try {
      await client.connect();

      // Get table information
      const tables = await Promise.all(
        this.expectedTables.map(async (tableName) => {
          try {
            // Check if table exists
            const existsResult = await client.query(`
              SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
              )
            `, [tableName]);

            const exists = existsResult.rows[0]?.exists || false;

            if (!exists) {
              return { name: tableName, exists: false };
            }

            // Get row count and column count
            const [rowCountResult, columnCountResult] = await Promise.all([
              client.query(`SELECT COUNT(*) as count FROM "${tableName}"`),
              client.query(`
                SELECT COUNT(*) as count 
                FROM information_schema.columns 
                WHERE table_name = $1 AND table_schema = 'public'
              `, [tableName])
            ]);

            return {
              name: tableName,
              exists: true,
              rowCount: parseInt(rowCountResult.rows[0]?.count || '0'),
              columns: parseInt(columnCountResult.rows[0]?.count || '0')
            };

          } catch (error) {
            return { name: tableName, exists: false };
          }
        })
      );

      // Get index information
      const indexResult = await client.query(`
        SELECT 
          indexname as name,
          tablename as table,
          true as exists
        FROM pg_indexes 
        WHERE schemaname = 'public'
        ORDER BY tablename, indexname
      `);

      const indexes = indexResult.rows;

      // Get constraint information
      const constraintResult = await client.query(`
        SELECT 
          tc.constraint_name as name,
          tc.table_name as table,
          tc.constraint_type as type,
          true as exists
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public'
        ORDER BY tc.table_name, tc.constraint_name
      `);

      const constraints = constraintResult.rows;

      return { tables, indexes, constraints };

    } finally {
      try {
        await client.end();
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  async validateForeignKeys(config: DatabaseConfig): Promise<{
    valid: boolean;
    brokenConstraints: Array<{
      constraint: string;
      table: string;
      error: string;
    }>;
  }> {
    const connectionString = config.directUrl || config.databaseUrl;
    const client = new Client({ connectionString });
    const brokenConstraints: Array<{ constraint: string; table: string; error: string }> = [];

    try {
      await client.connect();

      // Get all foreign key constraints
      const fkResult = await client.query(`
        SELECT 
          tc.constraint_name,
          tc.table_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'public'
      `);

      // Validate each foreign key constraint
      for (const fk of fkResult.rows) {
        try {
          await client.query(`
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = $1 AND table_name = $2
          `, [fk.constraint_name, fk.table_name]);
        } catch (error) {
          brokenConstraints.push({
            constraint: fk.constraint_name,
            table: fk.table_name,
            error: `Foreign key validation failed: ${error}`
          });
        }
      }

      return {
        valid: brokenConstraints.length === 0,
        brokenConstraints
      };

    } finally {
      try {
        await client.end();
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}