# Sinova Prettier Config

Configuration for Sinova Development projects.

## Installation

```bash
npm install @rpavlenko.sinova/prettier-config
```

or

```bash
pnpm add @rpavlenko.sinova/prettier-config
```

## Quick Setup

For basic setup of all tools, run:

```bash
npx sinova-general-config-init
```

## Configurations

### Prettier Configuration

**Main settings:**

```javascript
{
  printWidth: 120,
  trailingComma: 'all',
  singleQuote: true,
  singleAttributePerLine: true
}
```

**Required plugins:**

- `prettier-plugin-tailwindcss` - Automatic Tailwind CSS class sorting

**Install Prettier only:**

```bash
npx sinova-prettier-init
```

### Husky Configuration

**Pre-commit hooks:**

```bash
pnpm run pre-commit
```

**Install Husky only:**

```bash
npx sinova-husky-init
```

### Lint-staged Configuration

**Default settings:**

```json
{
  "lint-staged": {
    "**/*": "prettier --write --ignore-unknown"
  }
}
```

## Scripts

After installation, the following scripts are added to `package.json`:

```json
{
  "scripts": {
    "format": "prettier . --write --log-level=warn",
    "format:check": "prettier . --check --log-level=warn",
    "pre-commit": "pnpm install && git add pnpm-lock.yaml && pnpm lint-staged --allow-empty && tsc --noEmit"
  }
}
```
