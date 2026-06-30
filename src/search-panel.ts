import type { Panel } from '@codemirror/view';
import { EditorView } from '@codemirror/view';
import {
	SearchQuery,
	setSearchQuery,
	getSearchQuery,
	findNext,
	findPrevious,
	replaceNext,
	replaceAll,
	selectMatches,
	closeSearchPanel,
} from '@codemirror/search';

function addSvgIcon(parent: HTMLElement, pathData: string): void {
	const ns = 'http://www.w3.org/2000/svg';
	const svg = parent.createSvg('svg', {
		attr: {
			viewBox: '0 0 24 24',
			width: '14',
			height: '14',
			fill: 'none',
			stroke: 'currentColor',
			'stroke-width': '2.5',
			'stroke-linecap': 'round',
			'stroke-linejoin': 'round',
		},
	});
	const path = parent.ownerDocument.createElementNS(ns, 'path');
	path.setAttribute('d', pathData);
	svg.appendChild(path);
}

function iconBtn(parent: HTMLElement, label: string, pathData: string): HTMLButtonElement {
	const btn = parent.createEl('button', {
		cls: 'code-editor-search-icon',
		attr: { 'aria-label': label, 'data-tooltip-position': 'top', type: 'button' },
	});
	addSvgIcon(btn, pathData);
	return btn;
}

export function createSearchPanel(view: EditorView): Panel {
	let caseSensitive = false;
	let regexp = false;
	let wholeWord = false;

	const dom = createDiv({ cls: 'code-editor-search' });

	const findRow = dom.createDiv({ cls: 'code-editor-search-row' });
	const findInput = findRow.createEl('input', {
		cls: 'code-editor-search-field',
		attr: { placeholder: 'Find', 'aria-label': 'Find', type: 'text', 'main-field': 'true', form: '' },
	});

	const prevBtn = iconBtn(findRow, 'Previous match', 'M18 15l-6-6-6 6');
	const nextBtn = iconBtn(findRow, 'Next match', 'M6 9l6 6 6-6');

	const allBtn = findRow.createEl('button', {
		cls: 'code-editor-search-btn',
		attr: { 'aria-label': 'Select all matches', 'data-tooltip-position': 'top', type: 'button' },
	});
	allBtn.setText('All');

	findRow.createDiv({ cls: 'code-editor-search-sep' });

	const caseBtn = findRow.createEl('button', {
		cls: 'code-editor-search-toggle',
		attr: { 'aria-label': 'Match case', 'data-tooltip-position': 'top', type: 'button' },
	});
	caseBtn.setText('Aa');

	const regexpBtn = findRow.createEl('button', {
		cls: 'code-editor-search-toggle',
		attr: { 'aria-label': 'Regular expression', 'data-tooltip-position': 'top', type: 'button' },
	});
	regexpBtn.setText('.*');

	const wordBtn = findRow.createEl('button', {
		cls: 'code-editor-search-toggle',
		attr: { 'aria-label': 'Whole word', 'data-tooltip-position': 'top', type: 'button' },
	});
	wordBtn.setText('ab');

	const closeBtn = iconBtn(findRow, 'Close search', 'M18 6L6 18M6 6l12 12');
	closeBtn.addClass('code-editor-search-close');

	const replaceRow = dom.createDiv({ cls: 'code-editor-search-row' });
	const replaceInput = replaceRow.createEl('input', {
		cls: 'code-editor-search-field',
		attr: { placeholder: 'Replace', 'aria-label': 'Replace', type: 'text', form: '' },
	});

	const replaceSingleBtn = replaceRow.createEl('button', {
		cls: 'code-editor-search-btn',
		attr: { 'aria-label': 'Replace', 'data-tooltip-position': 'top', type: 'button' },
	});
	replaceSingleBtn.setText('Replace');

	const replaceAllBtn = replaceRow.createEl('button', {
		cls: 'code-editor-search-btn',
		attr: { 'aria-label': 'Replace all', 'data-tooltip-position': 'top', type: 'button' },
	});
	replaceAllBtn.setText('Replace all');

	function commit() {
		const query = new SearchQuery({
			search: findInput.value,
			replace: replaceInput.value,
			caseSensitive,
			regexp,
			wholeWord,
		});
		view.dispatch({ effects: setSearchQuery.of(query) });
	}

	function syncFromState() {
		const query = getSearchQuery(view.state);
		findInput.value = query.search;
		replaceInput.value = query.replace;
		caseSensitive = query.caseSensitive;
		regexp = query.regexp;
		wholeWord = query.wholeWord;
		caseBtn.toggleClass('is-active', caseSensitive);
		regexpBtn.toggleClass('is-active', regexp);
		wordBtn.toggleClass('is-active', wholeWord);
	}

	findInput.addEventListener('input', commit);
	replaceInput.addEventListener('input', commit);

	findInput.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (e.shiftKey) findPrevious(view);
			else findNext(view);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			closeSearchPanel(view);
			view.focus();
		}
	});

	replaceInput.addEventListener('keydown', (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			replaceNext(view);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			closeSearchPanel(view);
			view.focus();
		}
	});

	prevBtn.addEventListener('click', () => findPrevious(view));
	nextBtn.addEventListener('click', () => findNext(view));
	allBtn.addEventListener('click', () => selectMatches(view));

	caseBtn.addEventListener('click', () => {
		caseSensitive = !caseSensitive;
		caseBtn.toggleClass('is-active', caseSensitive);
		commit();
	});
	regexpBtn.addEventListener('click', () => {
		regexp = !regexp;
		regexpBtn.toggleClass('is-active', regexp);
		commit();
	});
	wordBtn.addEventListener('click', () => {
		wholeWord = !wholeWord;
		wordBtn.toggleClass('is-active', wholeWord);
		commit();
	});

	replaceSingleBtn.addEventListener('click', () => replaceNext(view));
	replaceAllBtn.addEventListener('click', () => replaceAll(view));
	closeBtn.addEventListener('click', () => {
		closeSearchPanel(view);
		view.focus();
	});

	return {
		dom,
		mount() {
			syncFromState();
			findInput.focus();
			findInput.select();
		},
		update(update) {
			for (const tr of update.transactions) {
				for (const effect of tr.effects) {
					if (effect.is(setSearchQuery) && !findInput.ownerDocument.contains(findInput.ownerDocument.activeElement === findInput ? null : findInput)) {
						syncFromState();
					}
				}
			}
		},
		top: false,
	};
}
