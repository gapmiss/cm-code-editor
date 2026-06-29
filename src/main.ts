import { Notice, Plugin } from 'obsidian';
import { CodeEditorSettingsTab, DEFAULT_SETTINGS } from './settings';
import type { PluginSettings } from './settings';
import { CodeEditorView, VIEW_TYPE } from './view';
import { FenceEditContext } from './fence-context';
import { FenceEditModal } from './fence-modal';
import { CreateCodeFileModal } from './create-modal';

export default class CodeEditorPlugin extends Plugin {
	settings: PluginSettings = DEFAULT_SETTINGS;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.registerView(VIEW_TYPE, (leaf) => new CodeEditorView(leaf, this));

		const failed: string[] = [];
		for (const ext of this.settings.extensions) {
			try {
				this.registerExtensions([ext], VIEW_TYPE);
			} catch {
				failed.push(ext);
			}
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
			id: 'edit-code-block',
			name: 'Edit code block',
			editorCheckCallback: (checking, editor) => {
				const context = FenceEditContext.create(editor);
				if (!context.isInFence()) return false;
				if (!checking) FenceEditModal.openOnCurrentCode(this);
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
			}),
		);

		this.registerEvent(
			this.app.workspace.on('editor-menu', (menu, editor) => {
				const context = FenceEditContext.create(editor);
				if (!context.isInFence()) return;
				menu.addItem((item) => {
					item.setTitle('Edit code block')
						.setIcon('code')
						.onClick(() => {
							FenceEditModal.openOnCurrentCode(this);
						});
				});
			}),
		);
	}

	onunload(): void {
		// Cleanup handled automatically by Obsidian
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
