import ReactMarkdown from "react-markdown";

// Renders AI answers (which come back as Markdown) with the site's styling.
// react-markdown does not render raw HTML, so model output can't inject markup.
export default function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-3 leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h3 className="font-serif text-lg font-semibold text-emerald-950">{children}</h3>,
          h2: ({ children }) => <h3 className="font-serif text-lg font-semibold text-emerald-950">{children}</h3>,
          h3: ({ children }) => <h4 className="font-semibold text-emerald-950">{children}</h4>,
          ul: ({ children }) => <ul className="list-disc space-y-1 pl-5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal space-y-1 pl-5">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold text-emerald-950">{children}</strong>,
          a: ({ children, href }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-700 underline">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
