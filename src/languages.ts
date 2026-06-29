import type { Extension } from '@codemirror/state';
import { LanguageSupport, StreamLanguage } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { css } from '@codemirror/lang-css';
import { html } from '@codemirror/lang-html';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { xml } from '@codemirror/lang-xml';
import { sql } from '@codemirror/lang-sql';
import { yaml } from '@codemirror/lang-yaml';
import { rust } from '@codemirror/lang-rust';
import { go } from '@codemirror/lang-go';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { php } from '@codemirror/lang-php';
import { shell } from '@codemirror/legacy-modes/mode/shell';
import { ruby } from '@codemirror/legacy-modes/mode/ruby';
import { lua } from '@codemirror/legacy-modes/mode/lua';
import { toml } from '@codemirror/legacy-modes/mode/toml';
import { r } from '@codemirror/legacy-modes/mode/r';
import { powerShell } from '@codemirror/legacy-modes/mode/powershell';
import { dockerFile } from '@codemirror/legacy-modes/mode/dockerfile';

type LanguageFactory = () => Extension;

const langMap = new Map<string, LanguageFactory>();

function register(exts: string[], factory: LanguageFactory): void {
	for (const ext of exts) {
		langMap.set(ext, factory);
	}
}

const shellLang = new LanguageSupport(StreamLanguage.define(shell));
const rubyLang = new LanguageSupport(StreamLanguage.define(ruby));
const luaLang = new LanguageSupport(StreamLanguage.define(lua));
const tomlLang = new LanguageSupport(StreamLanguage.define(toml));
const rLang = new LanguageSupport(StreamLanguage.define(r));
const powerShellLang = new LanguageSupport(StreamLanguage.define(powerShell));
const dockerFileLang = new LanguageSupport(StreamLanguage.define(dockerFile));

register(['ts', 'tsx', 'mts', 'cts'], () => javascript({ typescript: true, jsx: true }));
register(['js', 'jsx', 'mjs', 'cjs'], () => javascript({ jsx: true }));
register(['py', 'pyw', 'pyi'], () => python());
register(['css'], () => css());
register(['scss', 'less'], () => css());
register(['html', 'htm', 'svelte', 'vue'], () => html());
register(['json', 'jsonc'], () => json());
register(['md', 'markdown'], () => markdown());
register(['xml', 'svg', 'xsl', 'xsd'], () => xml());
register(['sql'], () => sql());
register(['yaml', 'yml'], () => yaml());
register(['rs'], () => rust());
register(['go'], () => go());
register(['c', 'h', 'cpp', 'hpp', 'cc', 'cxx', 'hxx'], () => cpp());
register(['java'], () => java());
register(['php'], () => php());
register(['sh', 'bash', 'zsh'], () => shellLang);
register(['rb', 'ruby'], () => rubyLang);
register(['lua'], () => luaLang);
register(['toml'], () => tomlLang);
register(['r', 'rmd'], () => rLang);
register(['ps1', 'psm1'], () => powerShellLang);
register(['dockerfile'], () => dockerFileLang);

export function resolveLanguage(ext: string): Extension {
	const factory = langMap.get(ext.toLowerCase());
	if (!factory) return [];
	return factory();
}

export function resolveLanguageByInfoString(info: string): Extension {
	const key = info.trim().toLowerCase();
	const aliasMap: Record<string, string> = {
		typescript: 'ts',
		javascript: 'js',
		python: 'py',
		rust: 'rs',
		golang: 'go',
		'c++': 'cpp',
		'c#': 'cs',
		ruby: 'rb',
		shell: 'sh',
		bash: 'bash',
		zsh: 'zsh',
		powershell: 'ps1',
	};
	const ext = aliasMap[key] ?? key;
	return resolveLanguage(ext);
}

export function getSupportedExtensions(): string[] {
	return [...new Set(langMap.keys())];
}
