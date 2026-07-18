import { ButtonComponent, DropdownComponent, Modal, Notice, TextComponent, TFile, TFolder, normalizePath } from 'obsidian';
import type { TAbstractFile } from 'obsidian';
import type CodeEditorPlugin from './main';

export class CreateCodeFileModal extends Modal {
	private fileName = '';
	private fileExtension: string;
	private targetPath: string;
	private plugin: CodeEditorPlugin;

	constructor(plugin: CodeEditorPlugin, parent?: TAbstractFile) {
		super(plugin.app);
		this.plugin = plugin;
		if (parent) {
			this.targetPath = parent instanceof TFile
				? (parent.parent?.path ?? '/')
				: parent.path;
		} else {
			const defaultPath = plugin.settings.defaultFolder.trim();
			this.targetPath = defaultPath ? normalizePath(defaultPath) : '/';
		}
		this.fileExtension = plugin.settings.extensions[0] ?? 'txt';
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass('code-editor-create-modal');

		this.setTitle('Create code file');

		const pathEl = contentEl.createEl('p', {
			cls: 'code-editor-create-modal-path',
		});
		pathEl.createSpan({ text: 'Creating in: ' });
		pathEl.createSpan({
			cls: 'code-editor-create-modal-path-value',
			text: this.targetPath,
		});

		const row = contentEl.createDiv({ cls: 'code-editor-create-modal-row' });

		const nameInput = new TextComponent(row);
		nameInput.setPlaceholder('File name');
		nameInput.inputEl.addClass('code-editor-create-modal-input');
		nameInput.onChange((value) => { this.fileName = value; });

		const extDropdown = new DropdownComponent(row);
		extDropdown.selectEl.addClass('code-editor-create-modal-ext');
		const options: Record<string, string> = {};
		for (const ext of this.plugin.settings.extensions) {
			options[ext] = `.${ext}`;
		}
		extDropdown.addOptions(options);
		extDropdown.setValue(this.fileExtension);
		extDropdown.onChange((value) => { this.fileExtension = value; });

		const submitButton = new ButtonComponent(contentEl);
		submitButton.setCta();
		submitButton.setButtonText('Create');
		submitButton.buttonEl.addClass('code-editor-create-modal-submit');
		submitButton.onClick(() => void this.create());

		nameInput.inputEl.addEventListener('keydown', (evt: KeyboardEvent) => {
			if (evt.key === 'Enter') {
				void this.create();
			}
		});

		extDropdown.selectEl.addEventListener('keydown', (evt: KeyboardEvent) => {
			if (evt.key === 'Enter') {
				void this.create();
			}
		});

		nameInput.inputEl.focus();
	}

	private async ensureFolder(folderPath: string): Promise<TFolder> {
		if (folderPath === '/') return this.app.vault.getRoot();
		const existing = this.app.vault.getAbstractFileByPath(folderPath);
		if (existing instanceof TFolder) return existing;
		await this.app.vault.createFolder(folderPath);
		const created = this.app.vault.getAbstractFileByPath(folderPath);
		if (created instanceof TFolder) return created;
		return this.app.vault.getRoot();
	}

	private async create(): Promise<void> {
		const name = this.fileName.trim();
		if (!name) {
			new Notice('File name cannot be empty.');
			return;
		}

		this.close();

		const folder = await this.ensureFolder(this.targetPath);
		const path = normalizePath(`${folder.path}/${name}.${this.fileExtension}`);
		const existing = this.app.vault.getAbstractFileByPath(path);

		if (existing instanceof TFile) {
			new Notice('File already exists.');
			const leaf = this.app.workspace.getLeaf(true);
			await leaf.openFile(existing);
			this.app.workspace.setActiveLeaf(leaf, { focus: true });
			return;
		}

		const newFile = await this.app.vault.create(path, '');
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(newFile);
		this.app.workspace.setActiveLeaf(leaf, { focus: true });
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
