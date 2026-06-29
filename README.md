# Code Editor

A code file editor for [Obsidian](https://obsidian.md) with syntax highlighting, code folding, and autocompletion. Powered by [CodeMirror 6](https://codemirror.net/).

## Features

- **Syntax highlighting** for 20+ languages with theme-aware colors
- **Autocompletion** with built-in language completions for JavaScript, TypeScript, CSS, HTML, SQL, and Python
- **Code folding** with gutter controls
- **Line numbers** with active line highlighting
- **Search and replace** (Ctrl/Cmd+F)
- **Bracket matching** and auto-closing
- **Rectangular selection** (Alt+drag)
- **Font size zoom** with Ctrl/Cmd+scroll
- **Create code file** command and context menu action
- **Configurable file extensions**, font family, and font size

## Supported languages

| Language | Extensions |
|----------|------------|
| TypeScript | `.ts` `.tsx` `.mts` `.cts` |
| JavaScript | `.js` `.jsx` `.mjs` `.cjs` |
| Python | `.py` `.pyw` `.pyi` |
| CSS/SCSS/Less | `.css` `.scss` `.less` |
| HTML | `.html` `.htm` `.svelte` `.vue` |
| JSON | `.json` `.jsonc` |
| Markdown | `.md` `.markdown` |
| XML | `.xml` `.svg` `.xsl` `.xsd` |
| SQL | `.sql` |
| YAML | `.yaml` `.yml` |
| Rust | `.rs` |
| Go | `.go` |
| C/C++ | `.c` `.h` `.cpp` `.hpp` `.cc` `.cxx` `.hxx` |
| Java | `.java` |
| PHP | `.php` |
| Shell | `.sh` `.bash` `.zsh` |
| Ruby | `.rb` `.ruby` |
| Lua | `.lua` |
| TOML | `.toml` |
| R | `.r` `.rmd` |
| PowerShell | `.ps1` `.psm1` |
| Dockerfile | `Dockerfile` |

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| File extensions | Comma-separated list of extensions to open with this editor | `ts, js, py, css, c, cpp, go, rs, java, lua, php, json, yaml, toml, sh, html, xml, sql, rb` |
| Line numbers | Show line numbers in the gutter | On |
| Code folding | Enable fold gutters | On |
| Word wrap | Wrap long lines to the editor width | Off |
| Font size | Font size in pixels (5-30) | 14 |
| Font family | CSS font-family value (empty inherits from Obsidian) | — |

## Installation

### From community plugins

1. Open **Settings > Community plugins**
2. Search for **Code Editor**
3. Click **Install**, then **Enable**

### Manual

1. Download `main.js`, `manifest.json`, and `styles.css` from the [latest release](https://github.com/gapmiss/code-editor/releases/latest)
2. Create a `code-editor` folder in your vault's `.obsidian/plugins/` directory
3. Copy the downloaded files into the folder
4. Enable the plugin in **Settings > Community plugins**

## License

[MIT](LICENSE)
