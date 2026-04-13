import { createHighlighter, type Highlighter } from 'shiki'

let highlighterPromise: Promise<Highlighter> | null = null

async function initHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['vitesse-dark'],
      langs: ['javascript', 'typescript', 'json', 'python', 'html', 'css', 'bash', 'sql']
    })
  }
  return highlighterPromise
}

export async function getHighlightedHtml(code: string, language: string) {
  const highlighter = await initHighlighter()
  try {
    return highlighter.codeToHtml(code.trim(), {
      lang: language,
      theme: 'vitesse-dark',
      transformers: [
        {
          pre(node) {
            delete node.properties['style']
          }
        }
      ]
    })
  } catch (e) {
    // Fallback if lang isn't loaded
    return `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`
  }
}
