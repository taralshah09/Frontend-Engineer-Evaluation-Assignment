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

function MarkdownInitialContentPlugin({ initialMarkdown }: { initialMarkdown: string }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        editor.update(() => {
            $convertFromMarkdownString(initialMarkdown, TRANSFORMERS);
        });
    }, [editor, initialMarkdown]);

    return null;
}

interface LexicalEditorProps {
    initialValue: string;
    onChange: (markdown: string) => void;
}

export function LexicalEditor({ initialValue, onChange }: LexicalEditorProps) {
    const initialConfig = {
        namespace: "TaskComposer",
        theme,
        onError: (error: Error) => console.error(error),
    };

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
