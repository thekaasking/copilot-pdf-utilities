# BUILD & PUBLISH GUIDE

## Prerequisites

* Node.js 20+
* npm 9+
* VS Code 1.100.0+
* `@vscode/vsce` (VS Code Extension CLI)

## Build Steps

### 1. Install Dependencies

```bash
cd extension
npm install
```

And the `vsce` CLI globally if not already:

```bash
npm install -g @vscode/vsce
```

### 2. Compile TypeScript

```bash
cd extension
npm run compile
```

Compiles `extension/src/` → `extension/dist/`.

### 3. Run Tests

```bash
cd extension
npm test
```

All 27 unit tests should pass.

### 4. Verify Icon

Ensure `extension/icon.png` exists (128×128 PNG).

### 5. Package Extension

```bash
cd extension
npm run package
```

Creates `pdf-utilities-<version>.vsix`.

### 6. Test Locally

Install the VSIX in VS Code:

1. Open VS Code
2. Extensions panel (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Click `...` menu → **Install from VSIX...**
4. Choose the generated `.vsix` file

Verify:

* Extension activates
* Tools appear in Copilot chat (`#pdf_read`, `#pdf_info`, etc.)
* `@pdf` chat participant is available
* PDF operations work correctly

## Publish to Marketplace

### First-Time Setup

1. **Create a publisher account**  
   Go to <https://marketplace.visualstudio.com/manage> and create a publisher using the same ID as `publisher` in `extension/package.json`.

2. **Generate a Personal Access Token (PAT)**  
   * Go to <https://dev.azure.com/> → User Settings → Personal Access Tokens  
   * Create a new token, set scope to **Marketplace → Manage**  
   * Copy the token immediately (it won't be shown again)

3. **Login with vsce**

   ```bash
   npx vsce login thekaasking
   # Enter your PAT when prompted
   ```

### Publishing

```bash
cd extension
npm run publish
```

Or using a PAT directly (useful in CI):

```bash
cd extension
npx vsce publish -p YOUR_PAT_TOKEN
```

### Version Updates

Before each publish:

1. Bump version in `extension/package.json`:

   ```json
   { "version": "2.1.0" }
   ```

2. Update `extension/CHANGELOG.md`:

   ```markdown
   ## [2.1.0] - 2025-XX-XX
   ### Added
   - New feature...
   ```

3. Rebuild and publish:

   ```bash
   cd extension
   npm run compile
   npm run package   # verify .vsix first
   npm run publish
   ```

## Troubleshooting

### "vsce not found"

```bash
npm install -g @vscode/vsce
```

### "Missing icon.png"

Use ImageMagick or any image editor to create a 128×128 PNG, or generate from an SVG:

```bash
cd extension
convert icon.svg -resize 128x128 icon.png
```

### TypeScript compile errors

Ensure you are running Node 20+. Then:

```bash
cd extension
npm install
npm run compile
```

### Tests fail

If `npm test` fails with `ts-jest` errors, ensure `tsconfig.test.json` exists in `extension/`. It must set `module: commonjs` to override the main `tsconfig.json`'s `module: nodenext`.
