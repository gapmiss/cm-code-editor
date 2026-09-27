# CM Code Editor user guide

CM Code Editor opens code files in your vault in a real code editor, with syntax highlighting, folding, search and replace, and themes. This guide covers everything the plugin does and every setting.

Requires Obsidian 1.13.0 or later.

## Contents

- [Opening code files](#opening-code-files)
- [Creating a code file](#creating-a-code-file)
- [Renaming a file and its extension](#renaming-a-file-and-its-extension)
- [Editing](#editing)
- [Search and replace](#search-and-replace)
- [Keyboard shortcuts](#keyboard-shortcuts)
- [Themes and fonts](#themes-and-fonts)
- [Settings](#settings)
- [Supported languages](#supported-languages)
- [Troubleshooting](#troubleshooting)

## Opening code files

Once the plugin is enabled, any file whose extension is in your **File extensions** setting opens in the code editor. Click it in the file explorer, open it from quick switcher, or follow a link to it, same as any other file.

These extensions are on the list out of the box:

`c` `cpp` `css` `go` `html` `java` `js` `json` `lua` `php` `py` `rb` `rs` `sh` `sql` `toml` `ts` `xml` `yaml`

Anything else, like `tsx`, `yml`, or `swift`, needs to be added. See [File extensions](#file-extensions). If another plugin already opens one of these, that plugin keeps it and you'll see a notice at startup. See [Troubleshooting](#troubleshooting).

The tab shows the full file name, such as `index.ts`, so files that differ only by extension are easy to tell apart. The title at the top of the editor shows the name without the extension. That's deliberate: renaming from that title only changes the name, never the extension.

## Creating a code file

There are two ways to create a new code file:

- **Command palette**: run **Create code file**. The file goes in your **Default folder**, or the vault root if that's empty. If the folder doesn't exist yet, it gets created.
- **File explorer**: right-click a folder and choose **Create code file here**. Right-clicking a file creates the new one next to it.

In the dialog, type a name, pick an extension from the dropdown, and press Enter or click **Create**. The new file opens in a new tab.

A few things worth knowing:

- Type the name without an extension. The dropdown adds it, so `app.js` with `.ts` selected becomes `app.js.ts`.
- The dropdown starts on the first extension in your **File extensions** setting. Reorder that list to change the default.
- If a file with that name already exists, it opens instead of being overwritten.

## Renaming a file and its extension

Obsidian's own rename (in the file explorer or the title above the editor) only changes the name. The extension stays put. To change the extension too, use **Rename with extension**:

- **Command palette**: run **Rename file with extension** while the file is open.
- **File explorer**: right-click the file and choose **Rename with extension**.

Edit the full name, including the extension, and press Enter.

You can rename to any extension that some view in Obsidian can open. That means extensions on your **File extensions** list, plus the ones Obsidian or other plugins handle, like `md` or `canvas`. If nothing can open the new extension, the dialog tells you and offers a link to the settings so you can add it. This stops you from accidentally turning a file into something Obsidian would hand off to another app.

If the file is open when you rename it, its tabs switch to the right editor. Renaming `notes.txt` to `notes.md` reopens it in the Markdown editor, and the reverse brings it back to the code editor.

## Editing

The editor behaves like the code editors you already know:

- **Autocompletion** pops up as you type. JavaScript, TypeScript, CSS, HTML, SQL, and Python have language-aware suggestions. Press Ctrl+Space to open the list yourself.
- **Brackets and quotes** close automatically, and matching brackets are highlighted.
- **Tab** indents with spaces using your **Tab size**. With a selection, Tab indents every selected line and Shift+Tab outdents them.
- **Code folding**: click the arrows in the gutter to collapse and expand blocks.
- **Multiple cursors**: Ctrl/Cmd+click to add a cursor, or hold Alt and drag to make a rectangular selection.
- **Matching text**: selecting a word highlights its other occurrences.
- **Zoom**: hold Ctrl or Cmd and scroll to change the font size. This updates the **Font size** setting, so it applies to every open code editor and sticks.

Changes save automatically, like everything else in Obsidian.

## Search and replace

Press Ctrl/Cmd+F to open the search bar at the bottom of the editor. If text is selected, it's used as the search.

- Type in **Find** to highlight matches as you go.
- Enter jumps to the next match, Shift+Enter to the previous one. The arrow buttons do the same.
- **All** selects every match at once, giving you a cursor at each one.
- The three toggles turn on **Aa** (match case), **.\*** (regular expression), and **ab** (whole word).
- Type in **Replace**, then use **Replace** for the current match or **Replace all** for every one. Pressing Enter in the Replace box replaces the current match.
- Escape closes the search bar and puts you back in the editor.

## Keyboard shortcuts

Ctrl/Cmd means Ctrl on Windows and Linux, Cmd on macOS.

| Action                        | Shortcut                        |
| ----------------------------- | ------------------------------- |
| Open search                   | Ctrl/Cmd+F                      |
| Next match                    | Ctrl/Cmd+G or F3                |
| Previous match                | Ctrl/Cmd+Shift+G or Shift+F3    |
| Select next occurrence        | Ctrl/Cmd+D                      |
| Open autocomplete             | Ctrl+Space                      |
| Indent / outdent              | Tab / Shift+Tab                 |
| Fold / unfold block (Windows, Linux) | Ctrl+Shift+[ / Ctrl+Shift+] |
| Fold / unfold block (macOS)   | Cmd+Alt+[ / Cmd+Alt+]           |
| Fold / unfold everything      | Ctrl+Alt+[ / Ctrl+Alt+]         |
| Add a cursor                  | Ctrl/Cmd+click                  |
| Rectangular selection         | Alt+drag                        |
| Zoom in / out                 | Ctrl/Cmd+scroll                 |

A few of these override Obsidian's own shortcuts while a code file is focused. Ctrl/Cmd+G finds the next match instead of opening the graph view, and Ctrl/Cmd+D selects the next occurrence instead of deleting a paragraph. They work as usual everywhere else.

The plugin doesn't assign hotkeys to its commands. To add some, go to **Settings → Hotkeys** and search for "CM Code Editor".

## Themes and fonts

By default the editor uses your Obsidian theme's code colors, so it matches code blocks in your notes and follows light and dark mode.

To use a dedicated color scheme instead, pick one of 45 themes under **Syntax theme**, including Dracula, GitHub, Monokai, Nord, Solarized, Tokyo Night, and VS Code. These themes have fixed colors, so a dark theme stays dark when Obsidian is in light mode.

The editor uses Obsidian's monospace font unless you set **Font family**. That field takes any CSS font list, like `'Fira Code', monospace`. The font must be installed on your device.

## Settings

Open **Settings → CM Code Editor**. Everything except the file extensions list applies right away to open editors.

### Files

#### File extensions

The extensions that open in the code editor, separated by commas. A leading dot is fine: `.ts` and `ts` both work.

After you add or remove extensions, reload the plugin so Obsidian picks up the change. The simplest way is to turn the plugin off and on again under **Settings → Community plugins**. One exception: an extension you've just added works right away in **Rename with extension**.

Default: `ts, js, py, css, c, cpp, go, rs, java, lua, php, json, yaml, toml, sh, html, xml, sql, rb`

#### Default folder

Where **Create code file** puts new files. Start typing to search your folders. Leave it empty to use the vault root. **Create code file here** in the file explorer ignores this and uses the folder you clicked.

Default: vault root

### Editor

| Setting       | What it does                                   | Default |
| ------------- | ---------------------------------------------- | ------- |
| Line numbers  | Shows line numbers in the gutter               | On      |
| Code folding  | Shows fold arrows in the gutter                | On      |
| Word wrap     | Wraps long lines instead of scrolling sideways | Off     |
| Tab size      | Spaces per indent level, 2 or 4                | 4       |
| Indent guides | Draws a vertical line at each indent level     | Off     |

### Theme

| Setting      | What it does                                        | Default            |
| ------------ | --------------------------------------------------- | ------------------ |
| Syntax theme | Colors for code. The default follows your Obsidian theme | Obsidian (default) |

### Font

| Setting     | What it does                                                   | Default           |
| ----------- | -------------------------------------------------------------- | ----------------- |
| Font size   | Size in pixels, from 5 to 30. Ctrl/Cmd+scroll changes it too   | 14                |
| Font family | Any CSS font list. Leave empty for Obsidian's monospace font   | Empty             |

## Supported languages

Highlighting is picked from the file extension. An extension without a language here still opens in the editor as plain text, as long as it's on your **File extensions** list.

| Language      | Extensions                                  |
| ------------- | ------------------------------------------- |
| C and C++     | `.c` `.h` `.cpp` `.hpp` `.cc` `.cxx` `.hxx` |
| C#            | `.cs` `.csx`                                |
| CSS, SCSS, Less | `.css` `.scss` `.less`                    |
| Dockerfile    | `.dockerfile`                               |
| Go            | `.go`                                       |
| HTML          | `.html` `.htm` `.svelte` `.vue`             |
| Java          | `.java`                                     |
| JavaScript    | `.js` `.jsx` `.mjs` `.cjs`                  |
| JSON          | `.json` `.jsonc` `.jsonl`                   |
| Lua           | `.lua`                                      |
| PHP           | `.php`                                      |
| PowerShell    | `.ps1` `.psm1`                              |
| Python        | `.py` `.pyw` `.pyi`                         |
| R             | `.r` `.rmd`                                 |
| Ruby          | `.rb` `.ruby`                               |
| Rust          | `.rs`                                       |
| Shell         | `.sh` `.bash` `.zsh`                        |
| SQL           | `.sql`                                      |
| Swift         | `.swift`                                    |
| TOML          | `.toml`                                     |
| TypeScript    | `.ts` `.tsx` `.mts` `.cts`                  |
| XML           | `.xml` `.xsl` `.xsd`                        |

Obsidian always opens `.md` and `.svg` files itself, so those can't be edited here.
| YAML          | `.yaml` `.yml`                              |

## Troubleshooting

**A file opens somewhere else, or not at all.** Check that its extension is on your **File extensions** list, then reload the plugin.

**"These extensions are already opened by Obsidian or another plugin."** Only one view can own an extension, and whoever loads first gets it. The code editor skips the ones it can't have and keeps working. To use the code editor for one of them, disable it in the other plugin (for example, Embed HTML takes `html`) and reload. Obsidian always keeps `md` for notes and `svg` for images, so those can't move to the code editor. To stop the notice, remove those extensions from **File extensions**.

**A file called `Dockerfile` doesn't open.** Obsidian matches files by extension, and `Dockerfile` has none. Name it something like `app.dockerfile` and add `dockerfile` to your extensions.

**I removed an extension but files still open in the code editor.** Reload the plugin. The list is only read when the plugin starts.

**Ctrl/Cmd+scroll zoom doesn't work on my phone or tablet.** Zoom needs a mouse or trackpad. Use the **Font size** setting instead.
