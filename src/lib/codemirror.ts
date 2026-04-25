import { javascript } from '@codemirror/lang-javascript'
import { python } from '@codemirror/lang-python'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { json } from '@codemirror/lang-json'
import type { Extension } from '@codemirror/state'

export function getLanguageExtension(language: string): Extension[] {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return [javascript({ typescript: language === 'typescript' })]
    case 'python':
      return [python()]
    case 'html':
      return [html()]
    case 'css':
      return [css()]
    case 'json':
      return [json()]
    default:
      return []
  }
}
