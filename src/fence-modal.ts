import { Modal } from 'obsidian';
import type { App } from 'obsidian';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import type { Extension } from '@codemirror/state';
import {
	bracketMatching,
	defaultHighlightStyle,
	indentOnInput,
	syntaxHighlighting,
} from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import { FenceEditContext } from './fence-context';
import type CodeEditorPlugin from './main';

export class FenceEditModal extends Modal {
	private editor: EditorView | null = null;
	private onSave: (content: string) => void;
	private code: string;
	private language: Extension;

	private constructor(
		app: App,
		code: string,
		language: Extension,
		onSave: (content: string) => void,
	) {
		super(app);
		this.code = code;
		this.language = language;
		this.onSave = onSave;
	}

	onOpen(): void {
		void super.onOpen();
		this.modalEl.addClass('code-editor-fence-modal');

		this.editor = new EditorView({
			state: EditorState.create({
				doc: this.code,
				extensions: [
					this.language,
					syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
					history(),
					bracketMatching(),
					closeBrackets(),
					indentOnInput(),
					highlightSelectionMatches(),
					EditorView.lineWrapping,
					keymap.of([
						...closeBracketsKeymap,
						...defaultKeymap,
						...searchKeymap,
						...historyKeymap,
						indentWithTab,
					]),
					EditorView.editorAttributes.of({ class: 'code-editor-cm code-editor-fence-cm' }),
				],
			}),
			parent: this.contentEl,
		});

		this.editor.focus();
	}

	onClose(): void {
		if (this.editor) {
			this.onSave(this.editor.state.doc.toString());
			this.editor.destroy();
			this.editor = null;
		}
		super.onClose();
	}

	static openOnCurrentCode(plugin: CodeEditorPlugin): void {
		const activeEditor = plugin.app.workspace.activeEditor?.editor;
		const context = FenceEditContext.create(activeEditor);

		if (!context.isInFence()) return;

		const fenceData = context.getFenceData();
		if (!fenceData) return;

		new FenceEditModal(
			plugin.app,
			fenceData.content,
			fenceData.language,
			(value) => context.replaceFenceContent(value),
		).open();
	}
}
