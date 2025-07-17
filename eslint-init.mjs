#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';

const eslintDependencies = [
  '@eslint/js',
  '@typescript-eslint/eslint-plugin',
  '@typescript-eslint/parser',
  'eslint',
  'eslint-plugin-import',
  'eslint-plugin-jsx-a11y',
  'eslint-plugin-react',
  'eslint-plugin-react-hooks',
  'eslint-plugin-react-refresh',
  'globals',
];

const lintStagedDependencies = ['lint-staged'];

const lintStagedConfig = {
  '**/*': 'prettier --write --ignore-unknown',
  '*.{js,jsx,ts,tsx,mjs,cjs}': 'eslint',
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = process.cwd();

function handleError(message, err) {
  console.error(`❌ ${message}:`, err.message);
  process.exit(1);
}

export async function setupEslint() {
  console.log('\n🔍 Setting up ESLint...');

  try {
    const eslintInstallCmd = `pnpm add -D ${[...eslintDependencies, ...lintStagedDependencies].join(' ')}`;
    console.log(`📦 Running: ${eslintInstallCmd}`);
    execSync(eslintInstallCmd, { stdio: 'inherit' });

    const eslintConfigPath = path.join(projectRoot, 'eslint.config.mjs');
    const templatePath = path.join(__dirname, 'eslint.config.template.mjs');
    const configContent = await fs.readFile(templatePath, 'utf-8');
    await fs.writeFile(eslintConfigPath, configContent);
    console.info('✅ eslint.config.mjs created.');

    const targetPackageJsonPath = path.join(projectRoot, 'package.json');
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));
    const lintScripts = {
      lint: 'eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0',
      'lint:fix': 'eslint . --ext .js,.jsx,.ts,.tsx --fix',
    };

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, lintScripts);
    targetPackageJson.lintStaged = merge({}, targetPackageJson['lint-staged'], lintStagedConfig);
    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Lint scripts added to package.json');
  } catch (err) {
    handleError('Error setting up ESLint', err);
  }
}
