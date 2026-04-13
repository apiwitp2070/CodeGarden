interface CodeBlockProps {
  html: string
}

export function CodeBlock({ html }: CodeBlockProps) {
  return (
    <div className="overflow-x-auto rounded-(--radius) p-4">
      <div
        className="font-mono text-sm leading-relaxed text-foreground/90 [&>pre]:bg-transparent [&>pre]:p-0! [&>pre]:m-0!"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
