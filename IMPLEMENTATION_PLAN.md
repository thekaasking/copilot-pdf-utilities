# PDF Utilities - Implementation Reference

## Project Overview

VS Code Extension that provides PDF manipulation tools to GitHub Copilot Chat via the VS Code Language Model Tools API (`vscode.lm.registerTool`). No MCP server required.

## Architecture

* **Extension-only approach**: 7 LM tools registered directly in the extension
* **Why**: Native VS Code API — works in all orgs including those with MCP disabled, no subprocess, no network
* **Benefits**: Fast, simple, self-contained

## Project Structure

```
pdf-utilities-mcp/
├── extension/               ← Primary working directory
│   ├── src/
│   │   ├── extension.ts    ← Activation, tool registration, @pdf participant
│   │   ├── tools.ts        ← 7 LanguageModelTool classes
│   │   └── pdf-tools.ts    ← PDF business logic (pdf-lib + pdf-parse)
│   ├── tests/
│   │   └── pdf-tools.test.ts ← 27 Jest unit tests
│   ├── resources/
│   │   └── instructions/
│   │       └── pdf-utilities.instructions.md  ← Copilot chat instructions
│   ├── dist/               ← Compiled extension (gitignored)
│   ├── package.json        ← Extension manifest (languageModelTools contributions)
│   ├── tsconfig.json       ← TypeScript config (module: nodenext)
│   └── tsconfig.test.json  ← Jest TypeScript config (module: commonjs)
```
