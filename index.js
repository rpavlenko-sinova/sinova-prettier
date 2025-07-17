import merge from 'lodash.merge';

export const baseConfig = {
  printWidth: 120,
  trailingComma: 'all',
  singleQuote: true,
  singleAttributePerLine: true,
};

export const requiredPlugins = ['prettier-plugin-tailwindcss'];

export function resolveConfig(externalConfig = {}) {
  const plugins = [...(externalConfig?.plugins ?? []), ...requiredPlugins];

  return merge({}, baseConfig, externalConfig, { plugins });
}
