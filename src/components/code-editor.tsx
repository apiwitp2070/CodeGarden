import { lazy, Suspense } from 'react'
import type { ReactCodeMirrorProps } from '@uiw/react-codemirror'
import { placeholder as cmPlaceholder } from '@codemirror/view'
import { Skeleton } from './ui/skeleton'

const CodeMirror = lazy(() => import('@uiw/react-codemirror'))

export function CodeEditor({ placeholder, extensions = [], ...props }: ReactCodeMirrorProps) {
  return (
    <Suspense fallback={<Skeleton className="w-full h-64 rounded-(--radius) bg-[#040a18]" />}>
      <CodeMirror
        theme="dark"
        extensions={[...(placeholder ? [cmPlaceholder(placeholder)] : []), ...extensions]}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: false,
          closeBrackets: false,
          autocompletion: false,
          rectangularSelection: false,
          crosshairCursor: false,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          highlightSelectionMatches: false,
          searchKeymap: false,
          bracketMatching: true
        }}
        className="overflow-hidden rounded-(--radius) bg-surface-recessed font-mono text-sm leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
        {...props}
        placeholder={undefined}
      />
    </Suspense>
  )
}
