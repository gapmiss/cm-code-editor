# Contributing

Thanks for helping out.

## Reporting bugs

[Open an issue](https://github.com/gapmiss/cm-code-editor/issues) and include:

- What you did, step by step
- What you expected, and what happened instead
- Your Obsidian version, operating system, and the file extension involved

## Setting up

```bash
npm install
npm run dev     # rebuilds main.js whenever a source file changes
```

To try your changes, put `main.js`, `manifest.json`, and `styles.css` in `.obsidian/plugins/cm-code-editor/` inside a test vault. A symlink from there to your clone saves copying after every build. Reload the plugin in Obsidian to pick up changes.

`CLAUDE.md` has a short tour of the code and explains the less obvious design choices.

## Pull requests

1. Fork the repo and create a branch.
2. Make your change.
3. Run `npm run build` and `npm run lint`. Both should pass with no errors or warnings.
4. Test it in Obsidian.
5. Open a PR that says what changed and why.

If your change affects how the plugin behaves, update [USER-GUIDE.md](USER-GUIDE.md) too.
