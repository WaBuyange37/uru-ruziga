import { readFileSync } from 'fs';
import { join } from 'path';
import { DatabaseConfig } from '../types/index.js';

export class ConfigManager {
  private static instance: ConfigManager;
  private config: DatabaseConfig | null = null;

  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  loadConfig(): DatabaseConfig {
    if (this.config) {
      return this.config;
    }

    try {
      // Load from .env file in project root
      const envPath = join(process.cwd(), '../../.env');
      const envContent = readFileSync(envPath, 'utf-8');
      
      const envVars: Record<string, string> = {};
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').replace(/^"(.*)"$/, '$1');
        }
      });

      this.config = {
        databaseUrl: envVars.DATABASE_URL || '',
        directUrl: envVars.DIRECT_URL || '',
        supabaseUrl: envVars.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseAnonKey: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        supabaseServiceKey: envVars.SUPABASE_SERVICE_ROLE_KEY || ''
      };

      return this.config;
    } catch (error) {
      throw new Error(`Failed to load configuration: ${error}`);
    }
  }

  validateConfig(config: DatabaseConfig): string[] {
    const errors: string[] = [];

    if (!config.databaseUrl) {
      errors.push('DATABASE_URL is missing');
    }

    if (!config.directUrl) {
      errors.push('DIRECT_URL is missing');
    }

    if (!config.supabaseUrl) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL is missing');
    }

    if (!config.supabaseAnonKey) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing');
    }

    if (!config.supabaseServiceKey) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY is missing');
    }

    return errors;
  }

  isValidPostgresUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'postgresql:' || parsed.protocol === 'postgres:';
    } catch {
      return false;
    }
  }
}