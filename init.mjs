#!/usr/bin/env node
import inquirer from 'inquirer';

import { setupPrettier } from './prettier-init.mjs';
import { setupHusky } from './husky-init.mjs';
import { setupLintStaged } from './lint-staged-init.mjs';

async function main() {
  console.log('🚀 Initializing development tools...');

  const { shouldInstallAll } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldInstallAll',
      message: 'Install all required development tools?',
      default: true,
    },
  ]);

  if (shouldInstallAll) {
    await setupPrettier();
    await setupHusky();
    await setupLintStaged();
    console.info('✨ All done!');
    return;
  }

  const { shouldSetupPrettier, shouldSetupHusky, shouldSetupLintStaged } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'shouldSetupPrettier',
      message: 'Set up Prettier configuration?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'shouldSetupHusky',
      message: 'Set up Husky with pre-commit hooks?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'shouldSetupLintStaged',
      message: 'Set up lint-staged configuration?',
      default: true,
    },
  ]);

  if (shouldSetupPrettier) {
    await setupPrettier();
  }

  if (shouldSetupHusky) {
    await setupHusky();
  }

  if (shouldSetupLintStaged) {
    await setupLintStaged();
  }

  console.info('✨ All done!');
}

main();
