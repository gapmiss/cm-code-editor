import type { Editor } from 'obsidian';
import { resolveLanguageByInfoString } from './languages';
import type { Extension } from '@codemirror/state';

export interface FenceData {
	content: string;
	language: Extension;
	infoString: string;
}

export class FenceEditContext {
	private start = 0;
	private end = 0;
	private editor: Editor | undefined;
	private valid = false;

	private constructor(editor: Editor | undefined) {
		this.editor = editor;
		if (this.editor) {
			this.findBounds();
			this.validate();
		}
	}

	static create(editor: Editor | undefined): FenceEditContext {
		return new FenceEditContext(editor);
	}

	private findBounds(): void {
		if (!this.editor) return;
		const cursor = this.editor.getCursor();
		this.start = cursor.line;
		this.end = cursor.line;

		while (this.start > 0) {
			this.start--;
			if (this.editor.getLine(this.start).startsWith('```')) break;
		}

		const lineCount = this.editor.lineCount();
		while (this.end < lineCount - 1) {
			this.end++;
			if (this.editor.getLine(this.end).startsWith('```')) break;
		}
	}

	private validate(): void {
		if (!this.editor) return;
		if (this.start < 0 || this.end >= this.editor.lineCount()) return;
		if (!this.editor.getLine(this.start).startsWith('```')) return;
		if (!this.editor.getLine(this.end).startsWith('```')) return;

		let fenceCount = 0;
		for (let i = 0; i < this.start; i++) {
			if (this.editor.getLine(i).startsWith('```')) {
				fenceCount++;
			}
		}
		if (fenceCount % 2 !== 0) return;

		this.valid = true;
	}

	isInFence(): boolean {
		return this.valid;
	}

	getFenceData(): FenceData | null {
		if (!this.editor || !this.valid) return null;

		const lines: string[] = [];
		for (let i = this.start + 1; i < this.end; i++) {
			lines.push(this.editor.getLine(i));
		}
		const content = lines.join('\n');
		const infoString = this.editor.getLine(this.start).slice(3).trim();
		const language = resolveLanguageByInfoString(infoString);

		return { content, language, infoString };
	}

	replaceFenceContent(value: string): void {
		if (!this.editor) return;
		this.editor.replaceRange(
			`${value}\n`,
			{ line: this.start + 1, ch: 0 },
			{ line: this.end, ch: 0 },
		);
	}
}
