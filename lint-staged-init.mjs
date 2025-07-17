#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';

const baseConfig = {
  '**/*': 'prettier --write --ignore-unknown',
  '*.{js,jsx,ts,tsx,mjs,cjs}': 'prettier --check',
};

const requiredDependencies = ['lint-staged'];

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();

function handleError(message, err) {
  console.error(`❌ ${message}:`, err.message);
  process.exit(1);
}

export async function setupLintStaged() {
  console.log(`🔍 Setting up lint-staged...`);

  try {
    const installCmd = `pnpm add -D ${requiredDependencies.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install dependencies', err);
  }

  const targetPackageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));

    const lintStagedScripts = {
      'pre-commit': 'lint-staged',
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, lintStagedScripts);

    if (!targetPackageJson['lint-staged']) {
      targetPackageJson['lint-staged'] = {};
    }

    targetPackageJson['lint-staged'] = merge({}, baseConfig, targetPackageJson['lint-staged']);

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ lint-staged config merged into package.json');
  } catch (err) {
    handleError('Error updating package.json', err);
  }
}
