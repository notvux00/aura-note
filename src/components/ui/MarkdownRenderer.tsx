"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn(
      "prose prose-sm prose-slate max-w-none break-words",
      "prose-p:leading-relaxed prose-p:my-1",
      "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
      "prose-strong:text-foreground prose-strong:font-semibold",
      "prose-ul:my-2 prose-ul:list-disc prose-li:my-0.5",
      "prose-headings:text-foreground prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4",
      className
    )}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom override to ensure links open safely in new tabs
          a: ({ node, ...props }) => <a target="_blank" rel="noopener noreferrer" {...props} />
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
