import { Client } from 'pg';
import { DatabaseConfig, ConnectionResult } from '../types/index.js';

export class ConnectionTester {
  async testConnection(config: DatabaseConfig): Promise<ConnectionResult> {
    const result: ConnectionResult = {
      pooledConnection: false,
      directConnection: false,
      latency: 0,
      error: undefined
    };

    try {
      // Test pooled connection (DATABASE_URL)
      const pooledResult = await this.testSingleConnection(config.databaseUrl, 'pooled');
      result.pooledConnection = pooledResult.success;
      
      // Test direct connection (DIRECT_URL)
      const directResult = await this.testSingleConnection(config.directUrl, 'direct');
      result.directConnection = directResult.success;
      
      // Calculate average latency
      const validLatencies = [pooledResult.latency, directResult.latency].filter(l => l > 0);
      result.latency = validLatencies.length > 0 
        ? validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length 
        : 0;

      // Collect errors
      const errors = [pooledResult.error, directResult.error].filter(Boolean);
      if (errors.length > 0) {
        result.error = errors.join('; ');
      }

    } catch (error) {
      result.error = `Connection test failed: ${error}`;
    }

    return result;
  }

  private async testSingleConnection(
    connectionString: string, 
    type: 'pooled' | 'direct'
  ): Promise<{ success: boolean; latency: number; error?: string }> {
    if (!connectionString) {
      return { success: false, latency: 0, error: `${type} connection string is empty` };
    }

    const client = new Client({ connectionString });
    const startTime = Date.now();

    try {
      // Set connection timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Connection timeout')), 10000);
      });

      // Test connection with timeout
      await Promise.race([
        client.connect(),
        timeoutPromise
      ]);

      // Test basic query
      await client.query('SELECT 1 as test');
      
      const latency = Date.now() - startTime;
      await client.end();

      return { success: true, latency };

    } catch (error) {
      try {
        await client.end();
      } catch {
        // Ignore cleanup errors
      }

      const latency = Date.now() - startTime;
      return { 
        success: false, 
        latency, 
        error: `${type} connection failed: ${error}` 
      };
    }
  }

  async testConnectionWithRetry(
    config: DatabaseConfig, 
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<ConnectionResult> {
    let lastResult: ConnectionResult | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      lastResult = await this.testConnection(config);
      
      // If any connection succeeded, return immediately
      if (lastResult.pooledConnection || lastResult.directConnection) {
        return lastResult;
      }

      // Wait before retry (except on last attempt)
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      }
    }

    return lastResult!;
  }

  parseConnectionString(connectionString: string): {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    ssl?: boolean;
    pooling?: boolean;
  } {
    try {
      const url = new URL(connectionString);
      const params = new URLSearchParams(url.search);
      
      return {
        host: url.hostname,
        port: url.port ? parseInt(url.port) : undefined,
        database: url.pathname.slice(1), // Remove leading slash
        user: url.username,
        ssl: params.has('sslmode') || params.has('ssl'),
        pooling: params.has('pgbouncer') || url.port === '6543'
      };
    } catch (error) {
      throw new Error(`Invalid connection string format: ${error}`);
    }
  }

  validateConnectionString(connectionString: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!connectionString) {
      errors.push('Connection string is empty');
      return { valid: false, errors };
    }

    try {
      const parsed = this.parseConnectionString(connectionString);
      
      if (!parsed.host) {
        errors.push('Missing host');
      }
      
      if (!parsed.database) {
        errors.push('Missing database name');
      }
      
      if (!parsed.user) {
        errors.push('Missing username');
      }

      if (parsed.port && (parsed.port < 1 || parsed.port > 65535)) {
        errors.push('Invalid port number');
      }

    } catch (error) {
      errors.push(`Invalid URL format: ${error}`);
    }

    return { valid: errors.length === 0, errors };
  }
}