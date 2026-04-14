// Core interfaces for database connection fix tool

export interface DatabaseConfig {
  databaseUrl: string;
  directUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
}

export interface ConnectionResult {
  pooledConnection: boolean;
  directConnection: boolean;
  latency: number;
  error?: string;
}

export interface CredentialResult {
  valid: boolean;
  permissions: string[];
  error?: string;
}

export interface SchemaResult {
  tablesExist: boolean;
  migrationsApplied: boolean;
  missingTables: string[];
  error?: string;
}

export interface DiagnosticReport {
  timestamp: Date;
  connectionStatus: ConnectionStatus;
  schemaStatus: SchemaStatus;
  seedDataStatus: SeedDataStatus;
  recommendations: Recommendation[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface Recommendation {
  issue: string;
  solution: string;
  priority: number;
  automated: boolean;
}

export interface ConfigFix {
  variable: string;
  oldValue: string;
  newValue: string;
  reason: string;
}

export interface DeploymentResult {
  success: boolean;
  tablesCreated: number;
  indexesCreated: number;
  error?: string;
}

export interface SeedResult {
  success: boolean;
  recordsCreated: number;
  recordsUpdated: number;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

export interface CrudTestResult {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  errors: string[];
}

export interface QueryTestResult {
  joins: boolean;
  aggregations: boolean;
  filters: boolean;
  errors: string[];
}

export interface TransactionTestResult {
  commit: boolean;
  rollback: boolean;
  errors: string[];
}

export interface PerformanceResult {
  averageQueryTime: number;
  maxQueryTime: number;
  connectionPoolHealth: boolean;
  errors: string[];
}

export interface FixPlan {
  steps: FixStep[];
  estimatedTime: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  backupRequired: boolean;
}

export interface FixStep {
  id: string;
  description: string;
  action: () => Promise<void>;
  rollback: () => Promise<void>;
  validation: () => Promise<boolean>;
}

export enum ConnectionStatus {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  PARTIAL = 'PARTIAL',
  UNKNOWN = 'UNKNOWN'
}

export enum SchemaStatus {
  DEPLOYED = 'DEPLOYED',
  MISSING = 'MISSING',
  PARTIAL = 'PARTIAL',
  OUTDATED = 'OUTDATED'
}

export enum SeedDataStatus {
  LOADED = 'LOADED',
  MISSING = 'MISSING',
  PARTIAL = 'PARTIAL',
  CORRUPTED = 'CORRUPTED'
}

export enum ConflictStrategy {
  SKIP = 'skip',
  OVERWRITE = 'overwrite',
  MERGE = 'merge'
}

// Core service interfaces
export interface DatabaseDiagnostic {
  testConnection(config: DatabaseConfig): Promise<ConnectionResult>;
  validateCredentials(config: DatabaseConfig): Promise<CredentialResult>;
  checkSchema(): Promise<SchemaResult>;
  generateReport(): Promise<DiagnosticReport>;
}

export interface ConnectionFixer {
  fixConnectionString(current: string): Promise<string>;
  updateEnvironmentConfig(fixes: ConfigFix[]): Promise<void>;
  testFixedConnection(): Promise<boolean>;
  rollbackChanges(): Promise<void>;
}

export interface SchemaDeployer {
  deploySchema(): Promise<DeploymentResult>;
  validateSchema(): Promise<ValidationResult>;
  generateMigrations(): Promise<Migration[]>;
  applyMigrations(migrations: Migration[]): Promise<void>;
}

export interface SeedManager {
  loadSeedData(): Promise<SeedResult>;
  validateSeedData(): Promise<ValidationResult>;
  clearDatabase(): Promise<void>;
  handleConflicts(strategy: ConflictStrategy): Promise<void>;
}

export interface OperationValidator {
  testCrudOperations(): Promise<CrudTestResult>;
  testComplexQueries(): Promise<QueryTestResult>;
  testTransactions(): Promise<TransactionTestResult>;
  measurePerformance(): Promise<PerformanceResult>;
}

export interface Migration {
  id: string;
  name: string;
  sql: string;
  rollbackSql: string;
}