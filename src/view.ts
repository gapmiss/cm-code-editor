import { Scope, TextFileView } from 'obsidian';
import type { TFile, ViewStateResult, WorkspaceLeaf } from 'obsidian';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { findNext, findPrevious, openSearchPanel } from '@codemirror/search';
import { resolveLanguage } from './languages';
import { applySettings, buildExtensions, createCompartments } from './extensions';
import type { EditorCompartments } from './extensions';
import type { PluginSettings } from './settings';
import type CodeEditorPlugin from './main';

export const VIEW_TYPE = 'code-editor';

declare module 'obsidian' {
	interface FileView {
		// Internal: the editable view header title.
		titleEl: HTMLElement;
		// Internal: FileView binds this to the vault 'delete' event in onload.
		onDelete(file: TFile): Promise<void>;
	}
}

export class CodeEditorView extends TextFileView {
	private editor: EditorView | null = null;
	private compartments: EditorCompartments = createCompartments();
	private plugin: CodeEditorPlugin;
	private suppressSave = false;

	constructor(leaf: WorkspaceLeaf, plugin: CodeEditorPlugin) {
		super(leaf);
		this.plugin = plugin;
		this.scope = new Scope(this.app.scope);
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.file?.name ?? 'Code';
	}

	async setState(state: unknown, result: ViewStateResult): Promise<void> {
		await super.setState(state, result);
		// FileView fills the header title from getDisplayText() on load, but
		// title rename appends the extension to whatever the user types, so
		// the full name would yield "a.md.txt". Keep the header at basename,
		// as FileView itself does on rename, blur, and Escape.
		if (this.file) this.titleEl.setText(this.file.basename);
	}

	getIcon(): string {
		return 'file-code';
	}

	getContext(file?: TFile): string {
		return file?.path ?? this.file?.path ?? '';
	}

	async onOpen(): Promise<void> {
		await super.onOpen();
		this.contentEl.addClass('code-editor-view');

		this.editor = new EditorView({
			state: EditorState.create({
				doc: '',
				extensions: buildExtensions(
					this.plugin.settings,
					this.compartments,
					'',
					() => { if (!this.suppressSave) this.requestSave(); },
				),
			}),
			parent: this.contentEl,
		});

		this.registerEvent(
			this.app.workspace.on('active-leaf-change', (leaf) => {
				if (leaf === this.leaf && this.editor) {
					this.editor.focus();
				}
			}),
		);

		this.scope!.register(['Mod'], 'f', (evt) => {
			if (!this.editor) return;
			evt.preventDefault();
			openSearchPanel(this.editor);
			return false;
		});

		this.scope!.register(['Mod'], 'g', (evt) => {
			if (!this.editor) return;
			evt.preventDefault();
			findNext(this.editor);
			return false;
		});

		this.scope!.register(['Mod', 'Shift'], 'g', (evt) => {
			if (!this.editor) return;
			evt.preventDefault();
			findPrevious(this.editor);
			return false;
		});

		this.scope!.register([], 'F3', (evt) => {
			if (!this.editor) return;
			evt.preventDefault();
			findNext(this.editor);
			return false;
		});

		this.scope!.register(['Shift'], 'F3', (evt) => {
			if (!this.editor) return;
			evt.preventDefault();
			findPrevious(this.editor);
			return false;
		});

		this.registerDomEvent(this.contentEl, 'wheel', (evt) => {
			if (!evt.ctrlKey && !evt.metaKey) return;
			evt.preventDefault();
			evt.stopPropagation();
			const delta = evt.deltaY < 0 ? 1 : -1;
			const newSize = Math.max(5, Math.min(30, this.plugin.settings.fontSize + delta));
			if (newSize === this.plugin.settings.fontSize) return;
			this.plugin.settings.fontSize = newSize;
			void this.plugin.saveSettings();
			this.plugin.applySettingsToOpenEditors();
		}, { capture: true, passive: false });
	}

	async onClose(): Promise<void> {
		await super.onClose();
		this.editor?.destroy();
		this.editor = null;
	}

	async onRename(file: TFile): Promise<void> {
		await super.onRename(file);
		if (file === this.file) this.updateLanguage(file.extension);
	}

	async onDelete(file: TFile): Promise<void> {
		const leaf = this.leaf;
		const wasOpen = file === this.file;
		await super.onDelete(file);
		// FileView swaps in the empty view via leaf.open(null), which does not
		// refresh the tab header, so our title and icon would linger. Setting
		// the view state again forces a header update.
		if (wasOpen && this.app.workspace.getLeavesOfType('empty').includes(leaf)) {
			await leaf.setViewState({ type: 'empty' });
		}
	}

	getViewData(): string {
		return this.editor?.state.doc.toString() ?? '';
	}

	setViewData(data: string, clear: boolean): void {
		if (!this.editor) return;

		if (clear) {
			this.compartments = createCompartments();
			this.editor.destroy();
			this.editor = new EditorView({
				state: EditorState.create({
					doc: data,
					extensions: buildExtensions(
						this.plugin.settings,
						this.compartments,
						this.file?.extension ?? '',
						() => { if (!this.suppressSave) this.requestSave(); },
					),
				}),
				parent: this.contentEl,
			});
		} else {
			const current = this.editor.state.doc.toString();
			if (current !== data) {
				this.editor.dispatch({
					changes: { from: 0, to: this.editor.state.doc.length, insert: data },
				});
			}
		}
	}

	clear(): void {
		if (!this.editor) return;
		this.suppressSave = true;
		this.editor.dispatch({
			changes: { from: 0, to: this.editor.state.doc.length, insert: '' },
		});
		this.suppressSave = false;
	}

	updateSettings(settings: PluginSettings): void {
		if (!this.editor) return;
		applySettings(this.editor, settings, this.compartments);
	}

	updateLanguage(ext: string): void {
		if (!this.editor) return;
		this.editor.dispatch({
			effects: this.compartments.lang.reconfigure(resolveLanguage(ext)),
		});
	}
}
