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
import { resolveLanguage } from './languages';
import type { PluginSettings } from './settings';

export interface EditorCompartments {
	lang: Compartment;
	lineNumbers: Compartment;
	folding: Compartment;
	wrap: Compartment;
	font: Compartment;
}

export function createCompartments(): EditorCompartments {
	return {
		lang: new Compartment(),
		lineNumbers: new Compartment(),
		folding: new Compartment(),
		wrap: new Compartment(),
		font: new Compartment(),
	};
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
		syntaxHighlighting(classHighlighter),

		compartments.lineNumbers.of(lineNumbersExtension(settings.lineNumbers)),
		compartments.folding.of(foldingExtension(settings.codeFolding)),
		compartments.wrap.of(wrapExtension(settings.wordWrap)),
		compartments.font.of(fontExtension(settings)),

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
		],
	});
}
