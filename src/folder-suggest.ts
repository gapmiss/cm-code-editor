import { AbstractInputSuggest } from 'obsidian';
import type { App } from 'obsidian';

export class FolderSuggest extends AbstractInputSuggest<string> {
	private folders: string[];
	private el: HTMLInputElement;

	constructor(app: App, inputEl: HTMLInputElement) {
		super(app, inputEl);
		this.el = inputEl;
		this.folders = this.app.vault.getAllFolders()
			.map(folder => folder.path)
			.sort();
		if (!this.folders.includes('/')) {
			this.folders.unshift('/');
		}
	}

	getSuggestions(inputStr: string): string[] {
		if (!inputStr) return this.folders;
		const q = inputStr.toLowerCase();
		return this.folders.filter(f => f.toLowerCase().includes(q));
	}

	renderSuggestion(folder: string, el: HTMLElement): void {
		el.createDiv({ text: folder });
	}

	selectSuggestion(folder: string): void {
		this.el.value = folder;
		this.el.dispatchEvent(new Event('input', { bubbles: true }));
		this.close();
	}
}
