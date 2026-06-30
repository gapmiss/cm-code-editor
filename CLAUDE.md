# Code Editor - Obsidian Plugin

## Overview

CodeMirror 6-based code file editor plugin for Obsidian. Opens registered file extensions in a CM6 editor view instead of Obsidian's default text view.

## Architecture

- `src/main.ts` — Plugin entry point. Registers the view, settings tab, commands, and file menu items.
- `src/view.ts` — `CodeEditorView` extends `TextFileView`. Creates and manages the CM6 `EditorView`. Handles file loading, saving, and Ctrl+scroll zoom.
- `src/extensions.ts` — CM6 extension builder. Uses **Compartments** for dynamic reconfiguration of: language, line numbers, folding, wrap, font, theme, tab size, indent guides.
- `src/settings.ts` — `PluginSettings` interface, defaults, theme options map, and settings tab using `getSettingDefinitions()` (Obsidian 1.13+ declarative API).
- `src/languages.ts` — Maps file extensions to CM6 language support. Includes modern language packages and legacy stream-based languages.
- `src/folder-suggest.ts` — `FolderSuggest` extending `AbstractInputSuggest` for fuzzy folder search in settings.
- `src/create-modal.ts` — Modal for creating new code files with extension dropdown.
- `styles.css` — Obsidian CSS variable mappings for `.tok-*` syntax classes (used when theme is "Obsidian default").

## Key patterns

- **Compartments** allow live-updating settings without rebuilding editor state. Each dynamic setting has a compartment in `EditorCompartments`, a function that returns an `Extension`, and is wired into both `buildExtensions()` and `applySettings()`.
- **Theme switching**: when theme is `''` (Obsidian default), the theme compartment contains `syntaxHighlighting(classHighlighter)` which applies `.tok-*` CSS classes styled by `styles.css`. When a CM6 theme is selected, `classHighlighter` is swapped out and the theme extension takes over.
- **Settings tab** uses `getSettingDefinitions()` (not `display()`). Custom controls like folder suggest use `SettingDefinitionRender` with a `render` callback.

## Build

```bash
npm run build    # tsc + esbuild
npm run dev      # esbuild watch mode
npm run lint     # eslint with eslint-plugin-obsidianmd
```

## Dependencies of note

- `@uiw/codemirror-themes-all` — 45+ CM6 syntax themes (requires `@babel/runtime`)
- `@replit/codemirror-indentation-markers` — indent guide lines
- `@codemirror/state` and `@codemirror/view` are pinned via `overrides` in `package.json`

## Obsidian conventions

- Uses Obsidian CSS variables for all styling (rule 32)
- Uses `AbstractInputSuggest` for folder suggest (rule 26)
- Uses `registerEvent()`/`registerDomEvent()` for cleanup (rule 6)
- Settings use sentence case (rule 11)
- No default hotkeys (rule 16)
- Uses `normalizePath()` for user paths (rule 22)
