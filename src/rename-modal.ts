import { ButtonComponent, FileView, Modal, TextComponent, normalizePath } from 'obsidian';
import type { TFile, WorkspaceLeaf } from 'obsidian';
import type CodeEditorPlugin from './main';
import { VIEW_TYPE } from './view';

const INVALID_CHARS = /[\\/:*?"<>|]/;

declare module 'obsidian' {
	interface App {
		// Internal: maps file extensions to the view types that open them.
		viewRegistry?: {
			isExtensionRegistered(extension: string): boolean;
		};
		// Internal: the settings modal.
		setting?: {
			open(): void;
			openTabById(id: string): unknown;
		};
	}
}

function getExtension(name: string): string {
	const dot = name.lastIndexOf('.');
	return dot > 0 ? name.slice(dot + 1).toLowerCase() : '';
}

export class RenameFileModal extends Modal {
	private plugin: CodeEditorPlugin;
	private file: TFile;
	private newName: string;
	private inputEl: HTMLInputElement | null = null;
	private errorEl: HTMLElement | null = null;

	constructor(plugin: CodeEditorPlugin, file: TFile) {
		super(plugin.app);
		this.plugin = plugin;
		this.file = file;
		this.newName = file.name;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass('code-editor-create-modal');

		this.setTitle('Rename with extension');

		const row = contentEl.createDiv({ cls: 'code-editor-create-modal-row' });

		const nameInput = new TextComponent(row);
		nameInput.setPlaceholder('File name');
		nameInput.setValue(this.newName);
		nameInput.inputEl.addClass('code-editor-create-modal-input');
		nameInput.inputEl.setAttr('aria-describedby', 'code-editor-rename-error');
		nameInput.onChange((value) => {
			this.newName = value;
			this.clearError();
		});
		this.inputEl = nameInput.inputEl;

		this.errorEl = contentEl.createDiv({
			cls: 'code-editor-rename-error',
			attr: { id: 'code-editor-rename-error', role: 'alert' },
		});
		this.errorEl.hide();

		const submitButton = new ButtonComponent(contentEl);
		submitButton.setCta();
		submitButton.setButtonText('Rename');
		submitButton.buttonEl.addClass('code-editor-create-modal-submit');
		submitButton.onClick(() => void this.rename());

		nameInput.inputEl.addEventListener('keydown', (evt: KeyboardEvent) => {
			if (evt.key === 'Enter') {
				evt.preventDefault();
				void this.rename();
			}
		});

		nameInput.inputEl.focus();
		nameInput.inputEl.setSelectionRange(0, this.file.basename.length);
	}

	private showError(message: string, settingsLink = false): void {
		if (!this.errorEl) return;
		this.errorEl.empty();
		this.errorEl.createSpan({ text: message });
		const setting = this.app.setting;
		if (settingsLink && setting) {
			this.errorEl.appendText(' ');
			const link = this.errorEl.createEl('a', {
				text: 'Open settings',
				href: '#',
			});
			link.addEventListener('click', (evt) => {
				evt.preventDefault();
				setting.open();
				setting.openTabById(this.plugin.manifest.id);
			});
		}
		this.errorEl.show();
		this.inputEl?.setAttr('aria-invalid', 'true');
	}

	private clearError(): void {
		if (!this.errorEl) return;
		this.errorEl.empty();
		this.errorEl.hide();
		this.inputEl?.removeAttribute('aria-invalid');
	}

	private async rename(): Promise<void> {
		const name = this.newName.trim();
		if (!name) {
			this.showError('File name cannot be empty.');
			return;
		}
		if (INVALID_CHARS.test(name)) {
			this.showError('File name cannot contain any of the following characters: \\ / : * ? " < > |');
			return;
		}
		if (name === this.file.name) {
			this.close();
			return;
		}
		const extension = getExtension(name);
		if (!extension) {
			this.showError('File name must include an extension.');
			return;
		}
		if (!this.canOpen(extension)) {
			this.showError(`No view can open ".${extension}" files. Add it to the file extensions in settings.`, true);
			return;
		}

		const parentPath = this.file.parent?.path ?? '/';
		const newPath = normalizePath(parentPath === '/' ? name : `${parentPath}/${name}`);
		const existing = this.app.vault.getAbstractFileByPath(newPath);
		// Allow case-only renames of the same file.
		if (existing && existing !== this.file) {
			this.showError('A file with that name already exists.');
			return;
		}

		this.close();

		const oldExtension = this.file.extension;
		await this.app.fileManager.renameFile(this.file, newPath);

		if (this.file.extension !== oldExtension) {
			await this.reopenInMatchingView();
		}
	}

	// Renaming to an extension no view handles would make Obsidian hand the
	// file to the OS, so only allow extensions this plugin or another view
	// (e.g. markdown, canvas) has registered. Extensions added in settings
	// since load are registered here so they work without a reload.
	private canOpen(extension: string): boolean {
		if (this.plugin.registeredExtensions.has(extension)) return true;
		if (this.plugin.settings.extensions.includes(extension)
			&& this.plugin.registerExtension(extension)) return true;
		return this.app.viewRegistry?.isExtensionRegistered(extension) ?? false;
	}

	// A leaf keeps its view type across renames, so a code file renamed to
	// .md would stay in the code editor (and vice versa). Reopen the file so
	// Obsidian picks the view registered for the new extension.
	private async reopenInMatchingView(): Promise<void> {
		const ownsExtension = this.plugin.registeredExtensions.has(this.file.extension);
		const leaves: WorkspaceLeaf[] = [];
		this.app.workspace.iterateAllLeaves((leaf) => {
			if (!(leaf.view instanceof FileView) || leaf.view.file !== this.file) return;
			const isCodeView = leaf.view.getViewType() === VIEW_TYPE;
			if (isCodeView !== ownsExtension) leaves.push(leaf);
		});
		for (const leaf of leaves) {
			await leaf.openFile(this.file);
		}
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
