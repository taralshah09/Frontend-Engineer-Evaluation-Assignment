"use client";

import React, { useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { $convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { EditorState } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode } from "@lexical/code";
import { LinkNode, AutoLinkNode } from "@lexical/link";

const theme = {
    paragraph: "editor-paragraph",
    list: {
        nested: {
            listitem: "editor-nested-listitem",
        },
        ol: "editor-list-ol",
        ul: "editor-list-ul",
        listitem: "editor-listitem",
    },
    text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
        strikethrough: "editor-text-strikethrough",
    },
};

// Defined at module scope so the object reference is stable across renders.
// If initialConfig is recreated inside the component, Lexical re-mounts the
// editor on every keystroke — that is the root cause of "typing in reverse".
const initialConfig = {
    namespace: "TaskComposer",
    theme,
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, LinkNode, AutoLinkNode],
    onError: (error: Error) => console.error(error),
};

function MarkdownInitialContentPlugin({ initialMarkdown }: { initialMarkdown: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        // Run only once on mount. If `initialMarkdown` were a dependency here
        // the effect would fire on every onChange call (because the parent
        // feeds the new markdown back as `initialValue`), and the editor
        // content would be overwritten continuously — breaking both normal
        // typing and markdown shortcuts.
        editor.update(() => {
            $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editor]);

    return null;
}

interface LexicalEditorProps {
    initialValue: string;
    onChange: (markdown: string) => void;
}

export function LexicalEditor({ initialValue, onChange }: LexicalEditorProps) {
    const handleChange = (editorState: EditorState) => {
        editorState.read(() => {
            const markdown = $convertToMarkdownString(TRANSFORMERS);
            onChange(markdown);
        });
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div className="editor-container" style={{ position: "relative" }}>
                <RichTextPlugin
                    contentEditable={
                        <ContentEditable
                            className="editor-input"
                            style={{
                                minHeight: 160,
                                outline: "none",
                                padding: "8px 12px",
                                fontFamily: "var(--font-geist-mono), monospace",
                                fontSize: 13,
                                color: "var(--text-primary)"
                            }}
                        />
                    }
                    placeholder={
                        <div
                            style={{
                                position: "absolute",
                                top: 8,
                                left: 12,
                                color: "var(--text-muted)",
                                pointerEvents: "none",
                                fontSize: 13
                            }}
                        >
                            Enter task details...
                        </div>
                    }
                    ErrorBoundary={LexicalErrorBoundary}
                />
                <HistoryPlugin />
                <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
                <OnChangePlugin onChange={handleChange} />
                <MarkdownInitialContentPlugin initialMarkdown={initialValue} />
            </div>
        </LexicalComposer>
    );
}
