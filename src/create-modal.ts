import { ButtonComponent, DropdownComponent, Modal, Notice, TextComponent, TFile, TFolder, normalizePath } from 'obsidian';
import type { TAbstractFile } from 'obsidian';
import type CodeEditorPlugin from './main';

export class CreateCodeFileModal extends Modal {
	private fileName = '';
	private fileExtension: string;
	private parent: TAbstractFile;
	private plugin: CodeEditorPlugin;

	constructor(plugin: CodeEditorPlugin, parent?: TAbstractFile) {
		super(plugin.app);
		this.plugin = plugin;
		if (parent) {
			this.parent = parent;
		} else {
			const defaultPath = plugin.settings.defaultFolder;
			const folder = defaultPath
				? plugin.app.vault.getFolderByPath(normalizePath(defaultPath))
				: null;
			this.parent = folder ?? plugin.app.vault.getRoot();
		}
		this.fileExtension = plugin.settings.extensions[0] ?? 'txt';
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.addClass('code-editor-create-modal');

		const nameInput = new TextComponent(contentEl);
		nameInput.setPlaceholder('File name');
		nameInput.onChange((value) => { this.fileName = value; });

		const extDropdown = new DropdownComponent(contentEl);
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

	private async create(): Promise<void> {
		const name = this.fileName.trim();
		if (!name) {
			new Notice('File name cannot be empty.');
			return;
		}

		this.close();

		const folder = this.parent instanceof TFile
			? this.parent.parent ?? this.app.vault.getRoot()
			: this.parent instanceof TFolder
				? this.parent
				: this.app.vault.getRoot();

		const path = normalizePath(`${folder.path}/${name}.${this.fileExtension}`);
		const existing = this.app.vault.getAbstractFileByPath(path);

		if (existing instanceof TFile) {
			new Notice('File already exists.');
			const leaf = this.app.workspace.getLeaf(true);
			await leaf.openFile(existing);
			return;
		}

		const newFile = await this.app.vault.create(path, '');
		const leaf = this.app.workspace.getLeaf(true);
		await leaf.openFile(newFile);
	}

	onClose(): void {
		this.contentEl.empty();
	}
}
