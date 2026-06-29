import { PluginSettingTab } from 'obsidian';
import type { App, SettingDefinitionItem } from 'obsidian';
import type CodeEditorPlugin from './main';

export interface PluginSettings {
	extensions: string[];
	lineNumbers: boolean;
	codeFolding: boolean;
	wordWrap: boolean;
	fontSize: number;
	fontFamily: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	extensions: ['ts', 'js', 'py', 'css', 'c', 'cpp', 'go', 'rs', 'java', 'lua', 'php', 'json', 'yaml', 'toml', 'sh', 'html', 'xml', 'sql', 'rb'],
	lineNumbers: true,
	codeFolding: true,
	wordWrap: false,
	fontSize: 14,
	fontFamily: '',
};

export class CodeEditorSettingsTab extends PluginSettingTab {
	plugin: CodeEditorPlugin;

	constructor(app: App, plugin: CodeEditorPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getControlValue(key: string): unknown {
		if (key === 'extensions') {
			return this.plugin.settings.extensions.join(', ');
		}
		return this.plugin.settings[key as keyof PluginSettings];
	}

	setControlValue(key: string, value: unknown): void {
		if (key === 'extensions') {
			this.plugin.settings.extensions = (value as string)
				.split(',')
				.map((s) => s.trim().replace(/^\./, ''))
				.filter((s) => s.length > 0);
		} else {
			const s = this.plugin.settings;
			const k = key as keyof PluginSettings;
			if (k === 'lineNumbers' || k === 'codeFolding' || k === 'wordWrap') {
				s[k] = value as boolean;
			} else if (k === 'fontSize') {
				s[k] = value as number;
			} else if (k === 'fontFamily') {
				s[k] = value as string;
			}
		}
		void this.plugin.saveSettings();
		this.plugin.applySettingsToOpenEditors();
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				type: 'group',
				heading: 'Editor',
				items: [
					{
						name: 'File extensions',
						desc: 'Comma-separated list of file extensions to open with this editor.',
						control: {
							type: 'textarea',
							key: 'extensions',
							defaultValue: DEFAULT_SETTINGS.extensions.join(', '),
							placeholder: 'ts, js, py, css, go, rs',
							rows: 3,
						},
					},
					{
						name: 'Line numbers',
						desc: 'Show line numbers in the gutter.',
						control: {
							type: 'toggle',
							key: 'lineNumbers',
							defaultValue: DEFAULT_SETTINGS.lineNumbers,
						},
					},
					{
						name: 'Code folding',
						desc: 'Enable code folding with fold gutters.',
						control: {
							type: 'toggle',
							key: 'codeFolding',
							defaultValue: DEFAULT_SETTINGS.codeFolding,
						},
					},
					{
						name: 'Word wrap',
						desc: 'Wrap long lines to the editor width.',
						control: {
							type: 'toggle',
							key: 'wordWrap',
							defaultValue: DEFAULT_SETTINGS.wordWrap,
						},
					},
				],
			},
			{
				type: 'group',
				heading: 'Font',
				items: [
					{
						name: 'Font size',
						desc: 'Font size in pixels (5–30). Use Ctrl+scroll in the editor to adjust.',
						control: {
							type: 'slider',
							key: 'fontSize',
							defaultValue: DEFAULT_SETTINGS.fontSize,
							min: 5,
							max: 30,
							step: 1,
						},
					},
					{
						name: 'Font family',
						desc: 'CSS font-family value. Leave empty to inherit from Obsidian.',
						control: {
							type: 'text',
							key: 'fontFamily',
							defaultValue: DEFAULT_SETTINGS.fontFamily,
							placeholder: "'Fira Code', monospace",
						},
					},
				],
			},
		];
	}
}
