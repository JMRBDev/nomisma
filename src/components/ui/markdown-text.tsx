import { memo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

const markdownPatterns = [
  /^#{1,6}\s/m,
  /^>\s/m,
  /^```[\s\S]*```$/m,
  /^(-|\*|\+)\s/m,
  /^\d+\.\s/m,
  /\[.+?\]\(.+?\)/,
  /(^|[^\w])(\*\*|__|`|~~).+?(\*\*|__|`|~~)([^\w]|$)/,
  /^\|.+\|\s*$/m,
]

function looksLikeMarkdown(content: string) {
  return markdownPatterns.some((pattern) => pattern.test(content))
}

export const MarkdownText = memo(function MarkdownText({
  content,
  className,
}: {
  content: string
  className?: string
}) {
  if (!looksLikeMarkdown(content)) {
    return (
      <div className={cn("break-words whitespace-pre-wrap", className)}>
        {content}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "space-y-3 text-sm leading-6 text-inherit [&_li>p]:my-0 [&_ol]:my-3 [&_ul]:my-3 [&_p]:my-3 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ className: linkClassName, ...props }) => (
            <a
              {...props}
              className={cn(
                "font-medium underline underline-offset-4",
                linkClassName
              )}
              rel="noreferrer"
              target="_blank"
            />
          ),
          blockquote: ({ className: blockquoteClassName, ...props }) => (
            <blockquote
              {...props}
              className={cn(
                "border-l-2 border-border/80 pl-4 text-muted-foreground italic",
                blockquoteClassName
              )}
            />
          ),
          code: ({ className: codeClassName, ...props }) => (
            <code
              {...props}
              className={cn(
                "rounded-md bg-foreground/8 px-1.5 py-0.5 font-mono text-[0.92em]",
                codeClassName
              )}
            />
          ),
          h1: ({ className: headingClassName, ...props }) => (
            <h1
              {...props}
              className={cn("text-base font-semibold", headingClassName)}
            />
          ),
          h2: ({ className: headingClassName, ...props }) => (
            <h2
              {...props}
              className={cn("text-sm font-semibold", headingClassName)}
            />
          ),
          h3: ({ className: headingClassName, ...props }) => (
            <h3
              {...props}
              className={cn("text-sm font-semibold", headingClassName)}
            />
          ),
          hr: ({ className: hrClassName, ...props }) => (
            <hr {...props} className={cn("border-border/80", hrClassName)} />
          ),
          ol: ({ className: listClassName, ...props }) => (
            <ol
              {...props}
              className={cn("list-decimal space-y-1 pl-5", listClassName)}
            />
          ),
          p: ({ className: paragraphClassName, ...props }) => (
            <p {...props} className={cn("break-words", paragraphClassName)} />
          ),
          pre: ({ className: preClassName, ...props }) => (
            <pre
              {...props}
              className={cn(
                "overflow-x-auto rounded-xl border border-border/80 bg-background/70 p-3 text-[0.92em] [&_code]:bg-transparent [&_code]:p-0",
                preClassName
              )}
            />
          ),
          table: ({ className: tableClassName, ...props }) => (
            <div className="my-1 overflow-x-auto">
              <table
                {...props}
                className={cn(
                  "w-full min-w-max border-collapse text-left text-[0.92em]",
                  tableClassName
                )}
              />
            </div>
          ),
          td: ({ className: cellClassName, ...props }) => (
            <td
              {...props}
              className={cn(
                "border border-border/80 px-2.5 py-1.5",
                cellClassName
              )}
            />
          ),
          th: ({ className: cellClassName, ...props }) => (
            <th
              {...props}
              className={cn(
                "border border-border/80 bg-foreground/5 px-2.5 py-1.5 font-medium",
                cellClassName
              )}
            />
          ),
          ul: ({ className: listClassName, ...props }) => (
            <ul
              {...props}
              className={cn("list-disc space-y-1 pl-5", listClassName)}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
})
