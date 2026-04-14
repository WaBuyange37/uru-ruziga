import { 
  DatabaseConfig, 
  DiagnosticReport, 
  ConnectionStatus, 
  SchemaStatus, 
  SeedDataStatus,
  Recommendation 
} from '../types/index.js';
import { ConnectionTester } from './connection-tester.js';
import { CredentialValidator } from './credential-validator.js';
import { SchemaChecker } from './schema-checker.js';
import { ConfigManager } from '../utils/config.js';

export class DiagnosticService {
  private connectionTester = new ConnectionTester();
  private credentialValidator = new CredentialValidator();
  private schemaChecker = new SchemaChecker();
  private configManager = ConfigManager.getInstance();

  async runFullDiagnosis(): Promise<DiagnosticReport> {
    const report: DiagnosticReport = {
      timestamp: new Date(),
      connectionStatus: ConnectionStatus.UNKNOWN,
      schemaStatus: SchemaStatus.MISSING,
      seedDataStatus: SeedDataStatus.MISSING,
      recommendations: [],
      severity: 'LOW'
    };

    try {
      // Load configuration
      const config = this.configManager.loadConfig();
      const configErrors = this.configManager.validateConfig(config);

      if (configErrors.length > 0) {
        report.recommendations.push({
          issue: 'Configuration errors detected',
          solution: `Fix the following configuration issues: ${configErrors.join(', ')}`,
          priority: 1,
          automated: false
        });
        report.severity = 'CRITICAL';
        return report;
      }

      // Test connections
      const connectionResult = await this.connectionTester.testConnection(config);
      report.connectionStatus = this.determineConnectionStatus(connectionResult);

      // Validate credentials
      const credentialResult = await this.credentialValidator.validateCredentials(config);
      
      // Check schema
      const schemaResult = await this.schemaChecker.checkSchema(config);
      report.schemaStatus = this.determineSchemaStatus(schemaResult);

      // Check seed data (basic check)
      report.seedDataStatus = await this.checkSeedDataStatus(config);

      // Generate recommendations
      report.recommendations = this.generateRecommendations(
        connectionResult,
        credentialResult,
        schemaResult,
        report.seedDataStatus
      );

      // Determine overall severity
      report.severity = this.determineSeverity(report);

    } catch (error) {
      report.recommendations.push({
        issue: 'Diagnostic process failed',
        solution: `Error during diagnosis: ${error}`,
        priority: 1,
        automated: false
      });
      report.severity = 'CRITICAL';
    }

    return report;
  }

  private determineConnectionStatus(connectionResult: any): ConnectionStatus {
    if (connectionResult.pooledConnection && connectionResult.directConnection) {
      return ConnectionStatus.CONNECTED;
    } else if (connectionResult.pooledConnection || connectionResult.directConnection) {
      return ConnectionStatus.PARTIAL;
    } else {
      return ConnectionStatus.DISCONNECTED;
    }
  }

  private determineSchemaStatus(schemaResult: any): SchemaStatus {
    if (schemaResult.error) {
      return SchemaStatus.MISSING;
    } else if (schemaResult.tablesExist && schemaResult.migrationsApplied) {
      return SchemaStatus.DEPLOYED;
    } else if (schemaResult.missingTables.length > 0) {
      return schemaResult.missingTables.length < 10 ? SchemaStatus.PARTIAL : SchemaStatus.MISSING;
    } else {
      return SchemaStatus.OUTDATED;
    }
  }

  private async checkSeedDataStatus(config: DatabaseConfig): Promise<SeedDataStatus> {
    try {
      const connectionString = config.directUrl || config.databaseUrl;
      if (!connectionString) {
        return SeedDataStatus.MISSING;
      }

      // This is a basic check - we'll implement more detailed checks later
      const { Client } = await import('pg');
      const client = new Client({ connectionString });
      
      try {
        await client.connect();
        
        // Check if languages table has data (basic seed data check)
        const result = await client.query('SELECT COUNT(*) as count FROM languages');
        const count = parseInt(result.rows[0]?.count || '0');
        
        if (count > 0) {
          return SeedDataStatus.LOADED;
        } else {
          return SeedDataStatus.MISSING;
        }
        
      } finally {
        try {
          await client.end();
        } catch {
          // Ignore cleanup errors
        }
      }
      
    } catch (error) {
      return SeedDataStatus.MISSING;
    }
  }

  private generateRecommendations(
    connectionResult: any,
    credentialResult: any,
    schemaResult: any,
    seedDataStatus: SeedDataStatus
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Connection recommendations
    if (!connectionResult.pooledConnection && !connectionResult.directConnection) {
      recommendations.push({
        issue: 'No database connections working',
        solution: 'Check database credentials and network connectivity. The error was: ' + connectionResult.error,
        priority: 1,
        automated: true
      });
    } else if (!connectionResult.pooledConnection) {
      recommendations.push({
        issue: 'Pooled connection (DATABASE_URL) not working',
        solution: 'Check DATABASE_URL configuration and pgbouncer settings',
        priority: 2,
        automated: true
      });
    } else if (!connectionResult.directConnection) {
      recommendations.push({
        issue: 'Direct connection (DIRECT_URL) not working',
        solution: 'Check DIRECT_URL configuration',
        priority: 2,
        automated: true
      });
    }

    // Credential recommendations
    if (!credentialResult.valid) {
      recommendations.push({
        issue: 'Database authentication failed',
        solution: 'Verify database username and password. Error: ' + credentialResult.error,
        priority: 1,
        automated: false
      });
    }

    // Schema recommendations
    if (schemaResult.missingTables && schemaResult.missingTables.length > 0) {
      recommendations.push({
        issue: `Missing ${schemaResult.missingTables.length} database tables`,
        solution: 'Run database migrations to create missing tables: npx prisma db push',
        priority: 1,
        automated: true
      });
    }

    if (!schemaResult.migrationsApplied) {
      recommendations.push({
        issue: 'Database migrations not applied',
        solution: 'Apply database migrations: npx prisma migrate deploy',
        priority: 1,
        automated: true
      });
    }

    // Seed data recommendations
    if (seedDataStatus === SeedDataStatus.MISSING) {
      recommendations.push({
        issue: 'Seed data not loaded',
        solution: 'Load initial data: npx prisma db seed',
        priority: 2,
        automated: true
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  private determineSeverity(report: DiagnosticReport): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (report.connectionStatus === ConnectionStatus.DISCONNECTED) {
      return 'CRITICAL';
    }

    if (report.schemaStatus === SchemaStatus.MISSING) {
      return 'HIGH';
    }

    if (report.connectionStatus === ConnectionStatus.PARTIAL || 
        report.schemaStatus === SchemaStatus.PARTIAL) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  async quickConnectionTest(config?: DatabaseConfig): Promise<{
    canConnect: boolean;
    error?: string;
    latency?: number;
  }> {
    try {
      const dbConfig = config || this.configManager.loadConfig();
      const result = await this.connectionTester.testConnection(dbConfig);
      
      return {
        canConnect: result.pooledConnection || result.directConnection,
        error: result.error,
        latency: result.latency
      };
    } catch (error) {
      return {
        canConnect: false,
        error: `Quick connection test failed: ${error}`
      };
    }
  }
}