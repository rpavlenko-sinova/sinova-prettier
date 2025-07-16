#!/usr/bin/env node
import fs from "fs/promises";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { requiredPlugins } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = process.cwd();
const prettierConfigPath = path.join(projectRoot, ".prettierrc.mjs");

async function main() {
  console.log("🧼 Initializing Prettier with sinova config...");

  const { shouldInstall } = await inquirer.prompt([
    {
      type: "confirm",
      name: "shouldInstall",
      message: `Install required Prettier plugins (${requiredPlugins.join(
        ", "
      )})?`,
      default: true,
    },
  ]);

  if (shouldInstall) {
    try {
      const installCmd = `npm install -D ${requiredPlugins.join(" ")}`;
      console.log(`📦 Running: ${installCmd}`);
      execSync(installCmd, { stdio: "inherit" });
    } catch (err) {
      console.error("❌ Failed to install plugins:", err.message);
      process.exit(1);
    }
  }

  const configContent = `import { resolveConfig } from 'sinova-prettier';

export default await resolveConfig({
  // optionally override defaults here
});
`;

  await fs.writeFile(prettierConfigPath, configContent);
  console.log("✅ .prettierrc.mjs created.");
  console.log("✨ Done!");
}

main();
