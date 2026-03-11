"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className = "" }: MarkdownRendererProps) {
    return (
        <div className={`markdown-content ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ node, ...props }) => <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }} {...props} />,
                    h2: ({ node, ...props }) => <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.875rem 0 0.5rem', color: 'var(--text-primary)' }} {...props} />,
                    h3: ({ node, ...props }) => <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.75rem 0 0.5rem', color: 'var(--text-primary)' }} {...props} />,
                    p: ({ node, ...props }) => <p style={{ margin: '0 0 0.75rem', lineHeight: 1.6 }} {...props} />,
                    ul: ({ node, ...props }) => <ul style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', listStyleType: 'disc' }} {...props} />,
                    ol: ({ node, ...props }) => <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.25rem', listStyleType: 'decimal' }} {...props} />,
                    li: ({ node, ...props }) => <li style={{ marginBottom: '0.25rem' }} {...props} />,
                    code: ({ node, ...props }) => (
                        <code
                            style={{
                                background: 'var(--surface-3, rgba(255,255,255,0.05))',
                                padding: '0.2rem 0.4rem',
                                borderRadius: '4px',
                                fontFamily: 'var(--font-geist-mono), monospace',
                                fontSize: '0.85em'
                            }}
                            {...props}
                        />
                    ),
                    pre: ({ node, ...props }) => (
                        <pre
                            style={{
                                background: 'var(--surface-3, rgba(255,255,255,0.05))',
                                padding: '1rem',
                                borderRadius: '8px',
                                overflowX: 'auto',
                                margin: '0.5rem 0 1rem',
                                border: '1px solid var(--border)'
                            }}
                            {...props}
                        />
                    ),
                    blockquote: ({ node, ...props }) => (
                        <blockquote
                            style={{
                                borderLeft: '4px solid var(--indigo)',
                                paddingLeft: '1rem',
                                margin: '1rem 0',
                                color: 'var(--text-muted)',
                                fontStyle: 'italic'
                            }}
                            {...props}
                        />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
