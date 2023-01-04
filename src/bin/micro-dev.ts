#!/usr/bin/env node
/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-console */

// Native
import Module from 'module';
import { existsSync } from 'fs';
import path from 'path';
// Packages
import mri from 'mri';
import dotEnv from 'dotenv';
// Utilities
import { generateHelp } from '../lib/help';
import { serve } from '../lib/serve';
import { version } from '../../package.json';
import { logError } from '../lib/error';

export interface Flags extends mri.Argv {
  host?: string,
  port?: number,
  limit?: string,
  dotenv?: string;
}

const flags: Flags = mri(process.argv.slice(2), {
  default: {
    host: '::',
    port: 3000,
    limit: '1mb',
    dotenv: '.env',
  },
  alias: {
    p: 'port',
    H: 'host',
    c: 'cold',
    w: 'watch',
    L: 'poll',
    s: 'silent',
    h: 'help',
    v: 'version',
    i: 'ignore',
    l: 'limit',
    d: 'dotenv',
  },
  unknown(flag) {
    console.log(`The option "${flag}" is unknown. Use one of these:`);
    console.log(generateHelp());
    process.exit(1);
  },
});

// When `-h` or `--help` are used, print out
// the usage information
if (flags.help) {
  console.log(generateHelp());
  process.exit();
}

// Print out the package's version when
// `--version` or `-v` are used
if (flags.version) {
  console.log(version);
  process.exit();
}

// Load the `.env` file
if (flags.dotenv) {
  dotEnv.config({
    path: path.resolve(process.cwd(), flags.dotenv),
  });
}

if (flags.cold && (flags.watch || flags.poll)) {
  logError(
    'The --cold flag is not compatible with --watch or --poll!',
    'watch-flags',
  );
  process.exit(1);
}

let file = flags._[0];

if (!file) {
  try {
    const req = Module.createRequire(module.filename);
    const packageJson: unknown = req(
      path.resolve(process.cwd(), 'package.json'),
    );
    if (hasMain(packageJson)) {
      file = packageJson.main;
    } else {
      file = 'index.js';
    }
  } catch (err: unknown) {
    if (isNodeError(err) && err.code !== 'MODULE_NOT_FOUND') {
      logError(
        `Could not read \`package.json\`: ${err.message}`,
        'invalid-package-json',
      );
      process.exit(1);
    }
  }
}

if (!file) {
  logError('No path defined!', 'path-missing');
  process.exit(1);
}

if (file.startsWith('/')) {
  file = path.resolve(process.cwd(), file);
}

if (!existsSync(file)) {
  logError(
    `The file or directory "${path.basename(file)}" doesn't exist!`,
    'path-not-existent',
  );
  process.exit(1);
}

serve(file, flags);

function hasMain(packageJson: unknown): packageJson is { main: string } {
  return (
    typeof packageJson === 'object' &&
    packageJson !== null &&
    'main' in packageJson
  );
}

function isNodeError(
  error: unknown,
): error is { code: string; message: string } {
  return error instanceof Error && 'code' in error;
}
