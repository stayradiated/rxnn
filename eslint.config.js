import svelte from 'eslint-plugin-svelte'
import ts from 'typescript-eslint'

import svelteConfig from './svelte.config.js'

export default ts.config(
  {
    ignores: [
      '.storybook/',
      '.svelte-kit/',
      'build/',
      'coverage/',
      'dist/',
      'src/lib/__generated__/',
      'storybook-static/',
    ],
  },
  ...svelte.configs.recommended,
  {
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        // not sure what this does, but it makes linting very slow
        // projectService: true,
        extraFileExtensions: ['.svelte'],
        parser: ts.parser,
        svelteConfig,
      },
    },
  },
  {
    files: ['**/*.svelte'],
    rules: {
      indent: 'off',
      'svelte/indent': [
        'error',
        {
          indent: 2,
          indentScript: false,
          ignoredNodes: ['SvelteScriptElement'],
        },
      ],
    },
  },
  {
    rules: {
      // this seems useful, but we are moving away from stores
      // 'svelte/prefer-destructured-store-props': 'error',
      //
      // disallow trailing whitespace at the end of lines
      'svelte/no-trailing-spaces': 'error',

      'svelte/first-attribute-linebreak': [
        'error',
        {
          multiline: 'below', // or "beside"
          singleline: 'beside', // "below"
        },
      ],
      'svelte/html-closing-bracket-new-line': [
        'error',
        {
          singleline: 'never', // ["never", "always"]
          multiline: 'never', // ["never", "always"]
          selfClosingTag: {
            singleline: 'never', // ["never", "always"]
            multiline: 'always', // ["never", "always"]
          },
        },
      ],
      'svelte/html-closing-bracket-spacing': [
        'error',
        {
          startTag: 'never', // or "always" or "ignore"
          endTag: 'never', // or "always" or "ignore"
          selfClosingTag: 'always', // or "never" or "ignore"
        },
      ],
      'svelte/html-quotes': [
        'error',
        {
          prefer: 'double', // or "single"
          dynamic: {
            quoted: false,
            avoidInvalidUnquotedInHTML: false,
          },
        },
      ],
      'svelte/html-self-closing': [
        'error',
        'default', // or "all" or "html" or "none"
      ],
      'svelte/max-attributes-per-line': [
        'error',
        {
          multiline: 1,
          singleline: 4,
        },
      ],
      'svelte/mustache-spacing': [
        'error',
        {
          textExpressions: 'never', // or "always"
          attributesAndProps: 'never', // or "always"
          directiveExpressions: 'never', // or "always"
          tags: {
            openingBrace: 'never', // or "always"
            closingBrace: 'never', // or "always" or "always-after-expression"
          },
        },
      ],
      'svelte/no-spaces-around-equal-signs-in-attribute': 'error',
      'svelte/prefer-class-directive': 'error',
      'svelte/prefer-style-directive': 'error',
      'svelte/require-event-prefix': 'error',
      'svelte/shorthand-attribute': 'error',
      'svelte/shorthand-directive': 'error',
    },
  },
)
