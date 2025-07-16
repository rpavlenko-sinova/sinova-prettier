#!/usr/bin/env node
import fs from "fs/promises";
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import { requiredPlugins } from "./index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const packageJsonPath = path.join(__dirname, "package.json");
const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf-8"));

const projectRoot = process.cwd();
const prettierConfigPath = path.join(projectRoot, ".prettierrc.mjs");

async function main() {
  console.log("🚀 Postinstall script starting...");
  console.log(`📁 Current working directory: ${projectRoot}`);
  console.log(`📦 Package name: ${packageJson.name}`);

  const currentPackageJsonPath = path.join(projectRoot, "package.json");
  console.log(`🔍 Checking package.json at: ${currentPackageJsonPath}`);

  try {
    const currentPackageJson = JSON.parse(
      await fs.readFile(currentPackageJsonPath, "utf-8")
    );
    console.log(`📋 Found package.json with name: ${currentPackageJson.name}`);

    if (currentPackageJson.name === packageJson.name) {
      console.log(
        "ℹ️  Running in package's own directory, skipping auto-setup"
      );
      return;
    }
    console.log("✅ Not running in package's own directory, continuing...");
  } catch (err) {
    console.log(`⚠️  Could not read current package.json: ${err.message}`);
    console.log("🔄 Continuing with auto-setup...");
  }

  console.log(
    `🧼 Auto-initializing Prettier with ${packageJson.name} config...`
  );

  const targetPackageJsonPath = path.join(projectRoot, "package.json");
  console.log(
    `🔍 Checking if target package.json exists: ${targetPackageJsonPath}`
  );

  try {
    await fs.access(targetPackageJsonPath);
    console.log("✅ Target package.json found");
  } catch (err) {
    console.log(`❌ Target package.json not found: ${err.message}`);
    console.log("ℹ️  Not in a project directory, skipping auto-setup");
    return;
  }

  try {
    console.log("📖 Reading target package.json to check for Prettier...");
    const targetPackageJson = JSON.parse(
      await fs.readFile(targetPackageJsonPath, "utf-8")
    );

    const hasPrettier =
      targetPackageJson.dependencies?.prettier ||
      targetPackageJson.devDependencies?.prettier;

    console.log(
      `🔍 Prettier in dependencies: ${!!targetPackageJson.dependencies
        ?.prettier}`
    );
    console.log(
      `🔍 Prettier in devDependencies: ${!!targetPackageJson.devDependencies
        ?.prettier}`
    );

    if (!hasPrettier) {
      console.log(
        "ℹ️  Prettier not found in dependencies, skipping auto-setup"
      );
      return;
    }
    console.log("✅ Prettier found in dependencies, continuing...");
  } catch (err) {
    console.log(`❌ Could not read package.json: ${err.message}`);
    console.log("ℹ️  Could not read package.json, skipping auto-setup");
    return;
  }

  // Install required plugins if not already present
  console.log("🔧 Checking for required plugins...");
  console.log(`📋 Required plugins: ${requiredPlugins.join(", ")}`);

  try {
    const targetPackageJson = JSON.parse(
      await fs.readFile(targetPackageJsonPath, "utf-8")
    );

    const allDeps = {
      ...targetPackageJson.dependencies,
      ...targetPackageJson.devDependencies,
    };

    const missingPlugins = requiredPlugins.filter((plugin) => !allDeps[plugin]);
    console.log(
      `🔍 Missing plugins: ${
        missingPlugins.length > 0 ? missingPlugins.join(", ") : "none"
      }`
    );

    if (missingPlugins.length > 0) {
      console.log(
        `📦 Installing missing plugins: ${missingPlugins.join(", ")}`
      );
      const installCmd = `pnpm add -D ${missingPlugins.join(" ")}`;
      console.log(`🚀 Running command: ${installCmd}`);
      execSync(installCmd, { stdio: "inherit" });
      console.log("✅ Plugin installation completed");
    } else {
      console.log("✅ All required plugins are already installed");
    }
  } catch (err) {
    console.log(`❌ Could not install plugins automatically: ${err.message}`);
  }

  // Create/update prettier config
  const newConfigContent = `import { resolveConfig } from '${packageJson.name}';

export default await resolveConfig({
  // optionally override defaults here
});
`;

  try {
    const existingConfig = await fs.readFile(prettierConfigPath, "utf-8");

    // Check if config already uses our package
    if (existingConfig.includes(packageJson.name)) {
      console.log("ℹ️  Prettier config already uses this package");
      return;
    }

    const updatedConfigContent = `import { resolveConfig } from '${
      packageJson.name
    }';

export default await resolveConfig({
  // optionally override defaults here
});

// Previous configuration (commented out):
${existingConfig
  .split("\n")
  .map((line) => `// ${line}`)
  .join("\n")}
`;

    await fs.writeFile(prettierConfigPath, updatedConfigContent);
    console.log(
      "✅ .prettierrc.mjs updated with new config (previous config commented out)."
    );
  } catch (err) {
    if (err.code === "ENOENT") {
      await fs.writeFile(prettierConfigPath, newConfigContent);
      console.log("✅ .prettierrc.mjs created.");
    } else {
      console.log("⚠️  Could not update prettier config:", err.message);
    }
  }

  // Add format scripts to package.json
  try {
    const targetPackageJson = JSON.parse(
      await fs.readFile(targetPackageJsonPath, "utf-8")
    );

    const formatScripts = {
      format: "prettier . --write --log-level=warn",
      "format:check": "prettier . --check --log-level=warn",
    };

    let scriptsAdded = false;

    if (!targetPackageJson.scripts) {
      targetPackageJson.scripts = {};
    }

    for (const [scriptName, scriptCommand] of Object.entries(formatScripts)) {
      if (!targetPackageJson.scripts[scriptName]) {
        targetPackageJson.scripts[scriptName] = scriptCommand;
        scriptsAdded = true;
      }
    }

    if (scriptsAdded) {
      await fs.writeFile(
        targetPackageJsonPath,
        JSON.stringify(targetPackageJson, null, 2) + "\n"
      );
      console.log("✅ Format scripts added to package.json");
    }
  } catch (err) {
    console.log("⚠️  Could not update package.json scripts:", err.message);
  }

  console.log("✨ Auto-setup complete!");
}

main();
