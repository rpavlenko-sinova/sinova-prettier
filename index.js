import merge from "lodash.merge";

export const baseConfig = {
  printWidth: 120,
  trailingComma: "all",
  singleQuote: true,
  singleAttributePerLine: true,
};

export const requiredPlugins = ["prettier-plugin-tailwindcss"];

export function resolveConfig(userConfig = {}) {
  const plugins = [];

  if (userConfig.plugins) {
    plugins.push(...userConfig.plugins);
  }

  plugins.push(...requiredPlugins);

  return merge({}, baseConfig, userConfig, { plugins });
}
