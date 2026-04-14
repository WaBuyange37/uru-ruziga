import chalk from 'chalk';
import ora from 'ora';
import { DiagnosticService } from '../services/diagnostic-service.js';
import { ConnectionStatus, SchemaStatus, SeedDataStatus } from '../types/index.js';

export class DiagnosticCommand {
  private diagnosticService = new DiagnosticService();

  async execute(options: { verbose?: boolean; json?: boolean }) {
    const spinner = ora('Starting database diagnosis...').start();
    
    try {
      spinner.text = 'Running comprehensive database diagnosis...';
      const report = await this.diagnosticService.runFullDiagnosis();
      
      spinner.succeed('Database diagnosis completed');
      
      if (options.json) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }
      
      this.displayReport(report, options.verbose);
    } catch (error) {
      spinner.fail('Diagnostic failed');
      throw error;
    }
  }

  private displayReport(report: any, verbose?: boolean) {
    console.log('\n' + chalk.bold('🔍 Database Diagnostic Report'));
    console.log(chalk.gray(`Generated: ${report.timestamp.toISOString()}`));
    console.log(chalk.gray(`Severity: ${this.getSeverityColor(report.severity)(report.severity)}`));
    
    console.log('\n' + chalk.bold('📊 Status Overview:'));
    console.log(`  Connection: ${this.getConnectionStatusDisplay(report.connectionStatus)}`);
    console.log(`  Schema: ${this.getSchemaStatusDisplay(report.schemaStatus)}`);
    console.log(`  Seed Data: ${this.getSeedDataStatusDisplay(report.seedDataStatus)}`);

    if (report.recommendations.length > 0) {
      console.log('\n' + chalk.bold('💡 Recommendations:'));
      report.recommendations.forEach((rec: any, index: number) => {
        const priority = rec.priority === 1 ? chalk.red('HIGH') : 
                        rec.priority === 2 ? chalk.yellow('MEDIUM') : 
                        chalk.green('LOW');
        const automated = rec.automated ? chalk.green('(Auto-fixable)') : chalk.gray('(Manual)');
        
        console.log(`  ${index + 1}. [${priority}] ${rec.issue} ${automated}`);
        console.log(`     ${chalk.gray('→')} ${rec.solution}`);
        
        if (verbose) {
          console.log(`     ${chalk.gray('Priority:')} ${rec.priority}, ${chalk.gray('Automated:')} ${rec.automated}`);
        }
        console.log();
      });
    }

    // Show summary
    const criticalIssues = report.recommendations.filter((r: any) => r.priority === 1).length;
    const autoFixable = report.recommendations.filter((r: any) => r.automated).length;
    
    console.log(chalk.bold('📋 Summary:'));
    console.log(`  • ${report.recommendations.length} issues found`);
    console.log(`  • ${criticalIssues} critical issues`);
    console.log(`  • ${autoFixable} auto-fixable issues`);
    
    if (autoFixable > 0) {
      console.log('\n' + chalk.blue('💡 Tip: Run ') + chalk.cyan('db-fix fix') + chalk.blue(' to automatically resolve fixable issues.'));
    }
  }

  private getSeverityColor(severity: string) {
    switch (severity) {
      case 'CRITICAL': return chalk.red.bold;
      case 'HIGH': return chalk.red;
      case 'MEDIUM': return chalk.yellow;
      case 'LOW': return chalk.green;
      default: return chalk.gray;
    }
  }

  private getConnectionStatusDisplay(status: ConnectionStatus): string {
    switch (status) {
      case ConnectionStatus.CONNECTED:
        return chalk.green('✓ Connected');
      case ConnectionStatus.PARTIAL:
        return chalk.yellow('⚠ Partial');
      case ConnectionStatus.DISCONNECTED:
        return chalk.red('✗ Disconnected');
      default:
        return chalk.gray('? Unknown');
    }
  }

  private getSchemaStatusDisplay(status: SchemaStatus): string {
    switch (status) {
      case SchemaStatus.DEPLOYED:
        return chalk.green('✓ Deployed');
      case SchemaStatus.PARTIAL:
        return chalk.yellow('⚠ Partial');
      case SchemaStatus.MISSING:
        return chalk.red('✗ Missing');
      case SchemaStatus.OUTDATED:
        return chalk.yellow('⚠ Outdated');
      default:
        return chalk.gray('? Unknown');
    }
  }

  private getSeedDataStatusDisplay(status: SeedDataStatus): string {
    switch (status) {
      case SeedDataStatus.LOADED:
        return chalk.green('✓ Loaded');
      case SeedDataStatus.PARTIAL:
        return chalk.yellow('⚠ Partial');
      case SeedDataStatus.MISSING:
        return chalk.red('✗ Missing');
      case SeedDataStatus.CORRUPTED:
        return chalk.red('✗ Corrupted');
      default:
        return chalk.gray('? Unknown');
    }
  }
}