#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';

const baseConfig = {
  '**/*': 'prettier --write --ignore-unknown',
};

const requiredDependencies = ['husky', 'lint-staged'];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = process.cwd();

function handleError(message, err) {
  console.error(`❌ ${message}:`, err.message);
  process.exit(1);
}

export async function setupHusky() {
  console.log('\n🐕 Setting up Husky...');

  try {
    const installCmd = `pnpm add -D ${requiredDependencies.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });

    console.log('🔧 Initializing Husky...');
    execSync('npx husky init', { stdio: 'inherit' });

    const huskyDir = path.join(projectRoot, '.husky');
    const preCommitHookPath = path.join(huskyDir, 'pre-commit');
    const preCommitContent = `pnpm run pre-commit`;

    await fs.writeFile(preCommitHookPath, preCommitContent);
    console.info('✅ Pre-commit hook updated');

    const targetPackageJsonPath = path.join(projectRoot, 'package.json');
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));

    const huskyScripts = {
      'pre-commit': 'pnpm install && git add pnpm-lock.yaml && pnpm lint-staged --allow-empty && tsc --noEmit',
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, huskyScripts);

    if (!targetPackageJson['lint-staged']) {
      targetPackageJson['lint-staged'] = {};
    }

    targetPackageJson['lint-staged'] = merge({}, baseConfig, targetPackageJson['lint-staged']);

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Pre-commit script and lint-staged config added to package.json');
  } catch (err) {
    handleError('Error setting up Husky', err);
  }
}
