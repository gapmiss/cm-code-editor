import { Notice, Plugin, TFile } from 'obsidian';
import { CodeEditorSettingsTab, DEFAULT_SETTINGS } from './settings';
import type { PluginSettings } from './settings';
import { CodeEditorView, VIEW_TYPE } from './view';
import { CreateCodeFileModal } from './create-modal';
import { RenameFileModal } from './rename-modal';

export default class CodeEditorPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;
	registeredExtensions = new Set<string>();

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(VIEW_TYPE, (leaf) => new CodeEditorView(leaf, this));

		const failed: string[] = [];
		for (const ext of this.settings.extensions) {
			if (!this.registerExtension(ext)) failed.push(ext);
		}
		if (failed.length > 0) {
			new Notice(`Code editor: could not register extensions already claimed by another plugin: ${failed.join(', ')}`);
		}

		this.addSettingTab(new CodeEditorSettingsTab(this.app, this));

		this.addCommand({
			id: 'create-file',
			name: 'Create code file',
			callback: () => {
				new CreateCodeFileModal(this).open();
			},
		});

		this.addCommand({
			id: 'rename-with-extension',
			name: 'Rename file with extension',
			checkCallback: (checking) => {
				const file = this.app.workspace.getActiveFile();
				if (!file) return false;
				if (!checking) new RenameFileModal(this, file).open();
				return true;
			},
		});

		this.registerEvent(
			this.app.workspace.on('file-menu', (menu, file) => {
				menu.addItem((item) => {
					item.setTitle('Create code file here')
						.setIcon('file-code')
						.onClick(() => {
							new CreateCodeFileModal(this, file).open();
						});
				});
				if (file instanceof TFile) {
					menu.addItem((item) => {
						item.setTitle('Rename with extension')
							.setIcon('pencil')
							.onClick(() => {
								new RenameFileModal(this, file).open();
							});
					});
				}
			}),
		);

	}

	onunload(): void {
		// Cleanup handled automatically by Obsidian
	}

	/** Returns false if another plugin or view already claims the extension. */
	registerExtension(ext: string): boolean {
		if (this.registeredExtensions.has(ext)) return true;
		try {
			this.registerExtensions([ext], VIEW_TYPE);
			this.registeredExtensions.add(ext);
			return true;
		} catch {
			return false;
		}
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<PluginSettings>);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}

	applySettingsToOpenEditors(): void {
		for (const leaf of this.app.workspace.getLeavesOfType(VIEW_TYPE)) {
			if (leaf.view instanceof CodeEditorView) {
				leaf.view.updateSettings(this.settings);
			}
		}
	}
}
