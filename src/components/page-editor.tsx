
import React, { useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import HeadingExtension from '@tiptap/extension-heading';
import { cn } from '@/lib/utils';

type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';

export interface PageEditorProps {
  noteContent: string;
  onNoteChange: (content: string) => void;
  backgroundStyle: PageBackground;
  pageTheme: PageTheme;
  editorRef?: React.MutableRefObject<Editor | null>;
}

const PageEditor: React.FC<PageEditorProps> = ({
  noteContent,
  onNoteChange,
  backgroundStyle,
  pageTheme,
  editorRef,
}) => {
  const themeClassMap: Record<PageTheme, string> = {
    light: 'page-theme-light',
    dark: 'page-theme-dark',
    pastel: 'page-theme-pastel',
  };

  const backgroundClassMap: Record<PageBackground, string> = {
    plain: '',
    lined: 'page-bg-lined',
    grid: 'page-bg-grid',
  };

  const placeholderText = `Start writing your thoughts here...\nThis is your aesthetic, single-page note space — minimal, classy, no distractions.\n\n*Nothing is saved. Everything burns.*`;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Disable other StarterKit extensions if not needed or to replace with custom ones
        gapcursor: false, // Example: If you don't need gapcursor
      }),
      UnderlineExtension,
      PlaceholderExtension.configure({
        placeholder: placeholderText,
      }),
      // Ensure Heading extension is configured correctly if not solely through StarterKit
      HeadingExtension.configure({ levels: [1, 2, 3] }),
    ],
    content: noteContent,
    onUpdate: ({ editor }) => {
      onNoteChange(editor.getHTML());
    },
    // Removed editorProps to apply class directly to EditorContent wrapper
  });

  useEffect(() => {
    if (editor && editorRef) {
      editorRef.current = editor;
    }
    return () => {
      if (editorRef) {
        editorRef.current = null;
      }
    };
  }, [editor, editorRef]);

  useEffect(() => {
    if (editor && editor.getHTML() !== noteContent) {
      // Safely update editor content if external noteContent changes
      // This prevents cursor jumps if noteContent is updated from localStorage for example
      const { from, to } = editor.state.selection;
      editor.commands.setContent(noteContent, false);
      editor.commands.setTextSelection({ from, to });
    }
  }, [noteContent, editor]);


  return (
    <div
      className={cn(
        'w-full max-w-3xl mx-auto p-8 md:p-12 rounded-xl shadow-xl min-h-[60vh] flex flex-col transition-colors duration-300',
        themeClassMap[pageTheme]
      )}
    >
      <h2 className="font-headline text-3xl md:text-4xl mb-6 pb-2 border-b border-[hsl(var(--line-color))]">
        Untitled Note
      </h2>
      <div
        className={cn(
          'flex-1 relative flex flex-col min-h-0', // Ensure this div can grow and scroll
          backgroundClassMap[backgroundStyle]
        )}
      >
        <EditorContent
          editor={editor}
          className="flex-1 overflow-y-auto tiptap-editor" // Added tiptap-editor class for specific styling
        />
      </div>
    </div>
  );
};

export default PageEditor;

