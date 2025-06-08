
import React, { useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import { cn } from '@/lib/utils';

type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';

export interface PageEditorProps {
  noteTitle: string;
  onNoteTitleChange: (title: string) => void;
  noteContent: string;
  onNoteChange: (content: string) => void;
  backgroundStyle: PageBackground;
  pageTheme: PageTheme;
  editorRef?: React.MutableRefObject<Editor | null>;
}

const PageEditor: React.FC<PageEditorProps> = ({
  noteTitle,
  onNoteTitleChange,
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
        gapcursor: false,
      }),
      UnderlineExtension,
      PlaceholderExtension.configure({
        placeholder: placeholderText,
      }),
    ],
    content: noteContent,
    onUpdate: ({ editor: tiptapEditor }) => {
      onNoteChange(tiptapEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none w-full',
      },
    },
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
    if (editor && editor.isEditable && editor.getHTML() !== noteContent) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(noteContent, false);
      // Ensure selection is within bounds after setting content
      const docSize = editor.state.doc.content.size;
      const newFrom = Math.min(from, docSize);
      const newTo = Math.min(to, docSize);
      if (newFrom <= docSize && newTo <= docSize) {
         editor.commands.setTextSelection({ from: newFrom, to: newTo });
      }
    }
  }, [noteContent, editor]);

  const handlePaperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Only focus if the click isn't directly on the editor's interactive content
    // or if the editor isn't already focused. This helps avoid interfering
    // with Tiptap's own click handling within actual text.
    if (editor && !editor.isFocused) {
       // Check if the click target is the paper div itself or a non-interactive child
       if (event.target === event.currentTarget || !(event.target as HTMLElement).closest('.ProseMirror')) {
        editor.chain().focus('end').run();
      }
    } else if (editor && editor.isFocused) {
      // If editor is focused, but click is on the "empty" paper area (e.g., padding),
      // also move cursor to end.
      if (event.target === event.currentTarget) {
         editor.chain().focus('end').run();
      }
    }
  };

  return (
    <div
      className={cn(
        'w-full max-w-3xl mx-auto p-8 md:p-12 rounded-xl shadow-xl min-h-[60vh] flex flex-col transition-colors duration-300',
        themeClassMap[pageTheme]
      )}
    >
      <input
        type="text"
        value={noteTitle}
        onChange={(e) => onNoteTitleChange(e.target.value)}
        className="font-headline text-3xl md:text-4xl mb-6 pb-2 border-b border-[hsl(var(--line-color))] bg-transparent focus:outline-none w-full placeholder-muted-foreground"
        placeholder="Untitled Note"
      />
      <div
        className={cn(
          'flex-1 relative flex flex-col min-h-0', 
          backgroundClassMap[backgroundStyle]
        )}
        onClick={handlePaperClick} // Add click handler here
      >
        <EditorContent
          editor={editor}
          className="flex-1 tiptap-editor" 
        />
      </div>
    </div>
  );
};

export default PageEditor;
