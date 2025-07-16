export const baseConfig = {
  printWidth: 120,
  trailingComma: "all",
  singleQuote: true,
  singleAttributePerLine: true,
};

export const requiredPlugins = ["prettier-plugin-tailwindcss"];

export async function resolveConfig(userConfig = {}) {
  const plugins = [];

  for (const pluginName of requiredPlugins) {
    try {
      const mod = await import(pluginName);
      plugins.push(mod.default || mod);
    } catch (e) {
      console.warn(
        `[sinova-prettier] Plugin ${pluginName} not found. Did you forget to install it?`
      );
    }
  }

  return {
    ...baseConfig,
    ...userConfig,
    plugins,
  };
}
