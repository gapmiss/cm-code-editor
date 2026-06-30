import { PluginSettingTab } from 'obsidian';
import type { App, SettingDefinitionItem } from 'obsidian';
import type CodeEditorPlugin from './main';
import { FolderSuggest } from './folder-suggest';

export interface PluginSettings {
	extensions: string[];
	lineNumbers: boolean;
	codeFolding: boolean;
	wordWrap: boolean;
	fontSize: number;
	fontFamily: string;
	theme: string;
	defaultFolder: string;
	tabSize: number;
	indentGuides: boolean;
}

export const DEFAULT_SETTINGS: PluginSettings = {
	extensions: ['ts', 'js', 'py', 'css', 'c', 'cpp', 'go', 'rs', 'java', 'lua', 'php', 'json', 'yaml', 'toml', 'sh', 'html', 'xml', 'sql', 'rb'],
	lineNumbers: true,
	codeFolding: true,
	wordWrap: false,
	fontSize: 14,
	fontFamily: '',
	theme: '',
	defaultFolder: '',
	tabSize: 4,
	indentGuides: false,
};

export const THEME_OPTIONS: Record<string, string> = {
	'': 'Obsidian (default)',
	'abcdef': 'Abcdef',
	'abyss': 'Abyss',
	'androidstudio': 'Android Studio',
	'andromeda': 'Andromeda',
	'atomone': 'Atom One',
	'aura': 'Aura',
	'basicDark': 'Basic dark',
	'basicLight': 'Basic light',
	'bbedit': 'BBEdit',
	'bespin': 'Bespin',
	'consoleDark': 'Console dark',
	'consoleLight': 'Console light',
	'copilot': 'Copilot',
	'darcula': 'Darcula',
	'dracula': 'Dracula',
	'duotoneDark': 'Duotone dark',
	'duotoneLight': 'Duotone light',
	'eclipse': 'Eclipse',
	'githubDark': 'GitHub dark',
	'githubLight': 'GitHub light',
	'gruvboxDark': 'Gruvbox dark',
	'gruvboxLight': 'Gruvbox light',
	'kimbie': 'Kimbie',
	'material': 'Material',
	'materialDark': 'Material dark',
	'materialLight': 'Material light',
	'monokai': 'Monokai',
	'monokaiDimmed': 'Monokai dimmed',
	'nord': 'Nord',
	'okaidia': 'Okaidia',
	'quietlight': 'Quiet Light',
	'red': 'Red',
	'solarizedDark': 'Solarized dark',
	'solarizedLight': 'Solarized light',
	'sublime': 'Sublime',
	'tokyoNight': 'Tokyo Night',
	'tokyoNightDay': 'Tokyo Night day',
	'tokyoNightStorm': 'Tokyo Night storm',
	'tomorrowNightBlue': 'Tomorrow Night blue',
	'vscodeDark': 'VS Code dark',
	'vscodeLight': 'VS Code light',
	'whiteDark': 'White dark',
	'whiteLight': 'White light',
	'xcodeDark': 'Xcode dark',
	'xcodeLight': 'Xcode light',
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
		if (key === 'tabSize') {
			return String(this.plugin.settings.tabSize);
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
			if (k === 'lineNumbers' || k === 'codeFolding' || k === 'wordWrap' || k === 'indentGuides') {
				s[k] = value as boolean;
			} else if (k === 'tabSize') {
				s[k] = Number(value);
			} else if (k === 'fontSize') {
				s[k] = value as number;
			} else if (k === 'fontFamily' || k === 'theme') {
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
				heading: 'Files',
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
						name: 'Default folder',
						desc: 'Default folder for new code files. Leave empty for vault root.',
						render: (setting) => {
							setting.addSearch((search) => {
								new FolderSuggest(this.app, search.inputEl);
								search.setPlaceholder('Vault folder');
								search.setValue(this.plugin.settings.defaultFolder);
								search.onChange((value) => {
									this.plugin.settings.defaultFolder = value;
									void this.plugin.saveSettings();
								});
							});
						},
					},
				],
			},
			{
				type: 'group',
				heading: 'Editor',
				items: [
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
					{
						name: 'Tab size',
						desc: 'Number of spaces per indent level.',
						control: {
							type: 'dropdown',
							key: 'tabSize',
							defaultValue: String(DEFAULT_SETTINGS.tabSize),
							options: { '2': '2', '4': '4' },
						},
					},
					{
						name: 'Indent guides',
						desc: 'Show vertical lines at each indent level.',
						control: {
							type: 'toggle',
							key: 'indentGuides',
							defaultValue: DEFAULT_SETTINGS.indentGuides,
						},
					},
				],
			},
			{
				type: 'group',
				heading: 'Theme',
				items: [
					{
						name: 'Syntax theme',
						desc: 'Choose a syntax highlighting theme. The default inherits colors from your Obsidian theme.',
						control: {
							type: 'dropdown',
							key: 'theme',
							defaultValue: DEFAULT_SETTINGS.theme,
							options: THEME_OPTIONS,
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
