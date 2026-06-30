import { TextFileView } from 'obsidian';
import type { TFile, WorkspaceLeaf } from 'obsidian';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { findNext, findPrevious, openSearchPanel, searchPanelOpen } from '@codemirror/search';
import { resolveLanguage } from './languages';
import { applySettings, buildExtensions, createCompartments } from './extensions';
import type { EditorCompartments } from './extensions';
import type { PluginSettings } from './settings';
import type CodeEditorPlugin from './main';

export const VIEW_TYPE = 'code-editor';

export class CodeEditorView extends TextFileView {
	private editor: EditorView | null = null;
	private compartments: EditorCompartments = createCompartments();
	private plugin: CodeEditorPlugin;
	private suppressSave = false;

	constructor(leaf: WorkspaceLeaf, plugin: CodeEditorPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE;
	}

	getDisplayText(): string {
		return this.file?.name ?? 'Code';
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

		this.registerDomEvent(window, 'keydown', (evt: KeyboardEvent) => {
			if (!this.editor) return;
			const mod = evt.ctrlKey || evt.metaKey;
			if (!mod || evt.altKey) return;
			const editorFocused = this.editor.hasFocus;
			const panelFocused = this.contentEl.contains(this.contentEl.ownerDocument.activeElement);
			if (!editorFocused && !panelFocused) return;

			if (evt.key === 'f' && !evt.shiftKey) {
				evt.preventDefault();
				evt.stopImmediatePropagation();
				openSearchPanel(this.editor);
			} else if ((evt.key === 'g' || evt.key === 'G') && searchPanelOpen(this.editor.state)) {
				evt.preventDefault();
				evt.stopImmediatePropagation();
				if (evt.shiftKey) findPrevious(this.editor);
				else findNext(this.editor);
			}
		}, { capture: true });

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
