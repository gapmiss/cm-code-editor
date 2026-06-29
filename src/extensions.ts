import { Compartment } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import {
	EditorView,
	crosshairCursor,
	drawSelection,
	dropCursor,
	highlightActiveLine,
	highlightActiveLineGutter,
	highlightSpecialChars,
	keymap,
	lineNumbers,
	rectangularSelection,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import {
	bracketMatching,
	codeFolding,
	foldGutter,
	foldKeymap,
	indentOnInput,
	syntaxHighlighting,
} from '@codemirror/language';
import { classHighlighter } from '@lezer/highlight';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';
import * as themes from '@uiw/codemirror-themes-all';
import { resolveLanguage } from './languages';
import type { PluginSettings } from './settings';

export interface EditorCompartments {
	lang: Compartment;
	lineNumbers: Compartment;
	folding: Compartment;
	wrap: Compartment;
	font: Compartment;
	theme: Compartment;
}

export function createCompartments(): EditorCompartments {
	return {
		lang: new Compartment(),
		lineNumbers: new Compartment(),
		folding: new Compartment(),
		wrap: new Compartment(),
		font: new Compartment(),
		theme: new Compartment(),
	};
}

const themeMap: Record<string, Extension> = {
	abcdef: themes.abcdef,
	abyss: themes.abyss,
	androidstudio: themes.androidstudio,
	andromeda: themes.andromeda,
	atomone: themes.atomone,
	aura: themes.aura,
	basicDark: themes.basicDark,
	basicLight: themes.basicLight,
	bbedit: themes.bbedit,
	bespin: themes.bespin,
	consoleDark: themes.consoleDark,
	consoleLight: themes.consoleLight,
	copilot: themes.copilot,
	darcula: themes.darcula,
	dracula: themes.dracula,
	duotoneDark: themes.duotoneDark,
	duotoneLight: themes.duotoneLight,
	eclipse: themes.eclipse,
	githubDark: themes.githubDark,
	githubLight: themes.githubLight,
	gruvboxDark: themes.gruvboxDark,
	gruvboxLight: themes.gruvboxLight,
	kimbie: themes.kimbie,
	material: themes.material,
	materialDark: themes.materialDark,
	materialLight: themes.materialLight,
	monokai: themes.monokai,
	monokaiDimmed: themes.monokaiDimmed,
	nord: themes.nord,
	okaidia: themes.okaidia,
	quietlight: themes.quietlight,
	red: themes.red,
	solarizedDark: themes.solarizedDark,
	solarizedLight: themes.solarizedLight,
	sublime: themes.sublime,
	tokyoNight: themes.tokyoNight,
	tokyoNightDay: themes.tokyoNightDay,
	tokyoNightStorm: themes.tokyoNightStorm,
	tomorrowNightBlue: themes.tomorrowNightBlue,
	vscodeDark: themes.vscodeDark,
	vscodeLight: themes.vscodeLight,
	whiteDark: themes.whiteDark,
	whiteLight: themes.whiteLight,
	xcodeLight: themes.xcodeLight,
	xcodeDark: themes.xcodeDark,
};

function themeExtension(name: string): Extension {
	if (name && themeMap[name]) return themeMap[name];
	return syntaxHighlighting(classHighlighter);
}

function lineNumbersExtension(enabled: boolean): Extension {
	return enabled ? [lineNumbers(), highlightActiveLineGutter()] : [];
}

function foldingExtension(enabled: boolean): Extension {
	return enabled ? [codeFolding(), foldGutter(), keymap.of(foldKeymap)] : [];
}

function wrapExtension(enabled: boolean): Extension {
	return enabled ? EditorView.lineWrapping : [];
}

function fontExtension(settings: PluginSettings): Extension {
	const family = settings.fontFamily || 'inherit';
	const size = `${settings.fontSize}px`;
	return EditorView.theme({
		'.cm-content': { fontFamily: family, fontSize: size },
		'.cm-gutters': { fontSize: size },
	});
}

export function buildExtensions(
	settings: PluginSettings,
	compartments: EditorCompartments,
	ext: string,
	onDocChange: () => void,
): Extension[] {
	return [
		compartments.lang.of(resolveLanguage(ext)),

		compartments.lineNumbers.of(lineNumbersExtension(settings.lineNumbers)),
		compartments.folding.of(foldingExtension(settings.codeFolding)),
		compartments.wrap.of(wrapExtension(settings.wordWrap)),
		compartments.font.of(fontExtension(settings)),
		compartments.theme.of(themeExtension(settings.theme)),

		highlightActiveLine(),
		highlightSpecialChars(),
		history(),
		drawSelection(),
		dropCursor(),
		indentOnInput(),
		bracketMatching(),
		closeBrackets(),
		autocompletion(),
		rectangularSelection(),
		crosshairCursor(),
		highlightSelectionMatches(),

		keymap.of([
			...closeBracketsKeymap,
			...defaultKeymap,
			...searchKeymap,
			...historyKeymap,
			...foldKeymap,
			...completionKeymap,
			indentWithTab,
		]),

		EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				onDocChange();
			}
		}),

		EditorView.editorAttributes.of({ class: 'code-editor-cm' }),
	];
}

export function applySettings(
	editor: EditorView,
	settings: PluginSettings,
	compartments: EditorCompartments,
): void {
	editor.dispatch({
		effects: [
			compartments.lineNumbers.reconfigure(lineNumbersExtension(settings.lineNumbers)),
			compartments.folding.reconfigure(foldingExtension(settings.codeFolding)),
			compartments.wrap.reconfigure(wrapExtension(settings.wordWrap)),
			compartments.font.reconfigure(fontExtension(settings)),
			compartments.theme.reconfigure(themeExtension(settings.theme)),
		],
	});
}
