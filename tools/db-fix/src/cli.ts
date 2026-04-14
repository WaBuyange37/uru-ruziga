#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { DiagnosticCommand } from './commands/diagnostic.js';
import { FixCommand } from './commands/fix.js';
import { ValidateCommand } from './commands/validate.js';
import { RecoverCommand } from './commands/recover.js';

const program = new Command();

program
  .name('db-fix')
  .description('Database connection diagnostic and fix tool for Umwero platform')
  .version('1.0.0');

// Add commands
program
  .command('diagnose')
  .description('Diagnose database connection issues')
  .option('-v, --verbose', 'Enable verbose output')
  .option('--json', 'Output results in JSON format')
  .action(async (options) => {
    try {
      const diagnostic = new DiagnosticCommand();
      await diagnostic.execute(options);
    } catch (error) {
      console.error(chalk.red('Error during diagnosis:'), error);
      process.exit(1);
    }
  });

program
  .command('fix')
  .description('Automatically fix database connection issues')
  .option('-y, --yes', 'Skip confirmation prompts')
  .option('--dry-run', 'Show what would be fixed without making changes')
  .action(async (options) => {
    try {
      const fix = new FixCommand();
      await fix.execute(options);
    } catch (error) {
      console.error(chalk.red('Error during fix:'), error);
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate database operations and performance')
  .option('--skip-performance', 'Skip performance tests')
  .action(async (options) => {
    try {
      const validate = new ValidateCommand();
      await validate.execute(options);
    } catch (error) {
      console.error(chalk.red('Error during validation:'), error);
      process.exit(1);
    }
  });

program
  .command('recover')
  .description('Emergency recovery procedures')
  .option('--backup-path <path>', 'Path to backup file')
  .action(async (options) => {
    try {
      const recover = new RecoverCommand();
      await recover.execute(options);
    } catch (error) {
      console.error(chalk.red('Error during recovery:'), error);
      process.exit(1);
    }
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s'), program.args.join(' '));
  console.log(chalk.yellow('See --help for a list of available commands.'));
  process.exit(1);
});

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}