#!/usr/bin/env node
import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import merge from 'lodash.merge';

import { requiredPlugins } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

const projectRoot = process.cwd();
const prettierConfigPath = path.join(projectRoot, '.prettierrc.mjs');
const prettierIgnorePath = path.join(projectRoot, '.prettierignore');

function generateConfigContent(packageName, existingConfig = null) {
  const baseConfig = `import { resolveConfig } from '${packageName}';

export default await resolveConfig({
  // optionally override defaults here
});`;

  if (existingConfig) {
    return `${baseConfig}

// Previous configuration (commented out):
${existingConfig
  .split('\n')
  .map((line) => `// ${line}`)
  .join('\n')}`;
  }

  return baseConfig;
}

function handleError(message, err) {
  console.error(`❌ ${message}:`, err.message);
  process.exit(1);
}

export async function setupPrettier() {
  console.log(`🧼 Setting up Prettier with ${packageJson.name} config...`);

  try {
    const installCmd = `pnpm add -D ${requiredPlugins.join(' ')}`;
    console.log(`📦 Running: ${installCmd}`);
    execSync(installCmd, { stdio: 'inherit' });
  } catch (err) {
    handleError('Failed to install plugins', err);
  }

  try {
    const existingConfig = await fs.readFile(prettierConfigPath, 'utf-8');
    const configContent = generateConfigContent(packageJson.name, existingConfig);
    await fs.writeFile(prettierConfigPath, configContent);
    console.info('✅ .prettierrc.mjs updated with new config (previous config commented out).');
  } catch (err) {
    if (err.code === 'ENOENT') {
      const configContent = generateConfigContent(packageJson.name);
      await fs.writeFile(prettierConfigPath, configContent);
      console.info('✅ .prettierrc.mjs created.');
    } else {
      handleError('Error handling config file', err);
    }
  }

  const targetPackageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const targetPackageJson = JSON.parse(await fs.readFile(targetPackageJsonPath, 'utf-8'));

    const formatScripts = {
      format: 'prettier . --write --log-level=warn',
      'format:check': 'prettier . --check --log-level=warn',
    };

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    targetPackageJson.scripts = merge({}, targetPackageJson.scripts, formatScripts);

    await fs.writeFile(targetPackageJsonPath, JSON.stringify(targetPackageJson, null, 2) + '\n');
    console.info('✅ Format scripts added to package.json');
  } catch (err) {
    handleError('Error updating package.json scripts', err);
  }

  try {
    await fs.access(prettierIgnorePath);
    console.info('✅ .prettierignore already exists');
  } catch (err) {
    if (err.code === 'ENOENT') {
      const prettierIgnoreContent = `.git

node_modules

pnpm-lock.yaml

.idea
`;
      await fs.writeFile(prettierIgnorePath, prettierIgnoreContent);
      console.info('✅ .prettierignore created');
    } else {
      handleError('Error checking .prettierignore', err);
    }
  }
}
