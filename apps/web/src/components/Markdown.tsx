import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import { cn } from '../lib/utils.js';

/**
 * Renders Card Markdown with GFM and highlighted code. The typography plugin wraps inline code
 * in literal backticks by default; Cards are full of code, so they are turned off.
 */
export function Markdown({ text, className }: { text: string; className?: string }) {
  return (
    <div
      className={cn(
        'prose prose-zinc dark:prose-invert max-w-none break-words prose-pre:text-sm prose-code:before:content-none prose-code:after:content-none',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
