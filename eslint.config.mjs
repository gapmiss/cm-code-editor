import tsParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";
import obsidianmd from "eslint-plugin-obsidianmd";

export default [
    { ignores: ["node_modules/**", "main.js", "*.mjs", "package.json", "package-lock.json", "versions.json", "tsconfig.json"] },
    // TypeScript-ESLint recommended rules WITH type checking
    ...tseslint.configs.recommendedTypeChecked.map(config => ({
        ...config,
        files: ["src/**/*.ts"],
    })),
    // Obsidian plugin rules (v0.3.0+)
    ...obsidianmd.configs.recommended,
    // Project-specific config
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: "./tsconfig.json",
                sourceType: "module",
            },
        },
        rules: {
            // Console: scanner allows warn, error, debug only
            "no-console": ["error", { allow: ["warn", "error", "debug"] }],
            // Allow underscore-prefixed unused params
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
        },
    },
];
