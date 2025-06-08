
import React, { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import TextAlignExtension from '@tiptap/extension-text-align';
import SuperscriptExtension from '@tiptap/extension-superscript';
import SubscriptExtension from '@tiptap/extension-subscript';
import LinkExtension from '@tiptap/extension-link';
import TextStyleExtension from '@tiptap/extension-text-style';
import ColorExtension from '@tiptap/extension-color';

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
  isDrawingMode: boolean;
  currentDrawTool: string | null;
  drawColor: string;
  drawStrokeWidth: number;
}

const PageEditor: React.FC<PageEditorProps> = ({
  noteTitle,
  onNoteTitleChange,
  noteContent,
  onNoteChange,
  backgroundStyle,
  pageTheme,
  editorRef,
  isDrawingMode,
  currentDrawTool,
  drawColor,
  drawStrokeWidth,
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
      TextAlignExtension.configure({
        types: ['heading', 'paragraph'],
      }),
      SuperscriptExtension,
      SubscriptExtension,
      LinkExtension.configure({
        openOnClick: true,
        autolink: true,
        defaultProtocol: 'https',
      }),
      TextStyleExtension,
      ColorExtension,
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);


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
      const docSize = editor.state.doc.content.size;
      const newFrom = Math.min(from, docSize);
      const newTo = Math.min(to, docSize);
      if (newFrom <= docSize && newTo <= docSize) {
         editor.commands.setTextSelection({ from: newFrom, to: newTo });
      }
    }
  }, [noteContent, editor]);
  
  useEffect(() => {
    if (editor) {
      editor.setEditable(!isDrawingMode);
    }
  }, [isDrawingMode, editor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isDrawingMode || currentDrawTool !== 'pen') {
      setIsPainting(false);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Ensure canvas dimensions match its container
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    }
    

    const getMousePosition = (event: MouseEvent | TouchEvent): { x: number; y: number } | null => {
      const rect = canvas.getBoundingClientRect();
      let clientX, clientY;
      if (event instanceof MouseEvent) {
        clientX = event.clientX;
        clientY = event.clientY;
      } else if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else {
        return null;
      }
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    };

    const startPaint = (event: MouseEvent | TouchEvent) => {
      event.preventDefault(); // Prevent text selection or other default actions
      if (currentDrawTool !== 'pen') return;
      const pos = getMousePosition(event);
      if (!pos) return;
      setIsPainting(true);
      setLastPosition(pos);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };

    const paint = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      if (!isPainting || currentDrawTool !== 'pen' || !lastPosition) return;
      const pos = getMousePosition(event);
      if (!pos) return;

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      setLastPosition(pos);
    };

    const endPaint = () => {
      if (!isPainting) return;
      setIsPainting(false);
      setLastPosition(null);
      ctx.closePath();
    };

    canvas.addEventListener('mousedown', startPaint);
    canvas.addEventListener('mousemove', paint);
    canvas.addEventListener('mouseup', endPaint);
    canvas.addEventListener('mouseleave', endPaint);
    
    canvas.addEventListener('touchstart', startPaint, { passive: false });
    canvas.addEventListener('touchmove', paint, { passive: false });
    canvas.addEventListener('touchend', endPaint);
    canvas.addEventListener('touchcancel', endPaint);


    return () => {
      canvas.removeEventListener('mousedown', startPaint);
      canvas.removeEventListener('mousemove', paint);
      canvas.removeEventListener('mouseup', endPaint);
      canvas.removeEventListener('mouseleave', endPaint);
      canvas.removeEventListener('touchstart', startPaint);
      canvas.removeEventListener('touchmove', paint);
      canvas.removeEventListener('touchend', endPaint);
      canvas.removeEventListener('touchcancel', endPaint);
    };
  }, [isDrawingMode, currentDrawTool, isPainting, drawColor, drawStrokeWidth, lastPosition]);


  const handlePaperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawingMode) return; // Don't focus editor if drawing

    if (editor && !editor.isFocused) {
       if (event.target === event.currentTarget || !(event.target as HTMLElement).closest('.ProseMirror')) {
        editor.chain().focus('end').run();
      }
    } else if (editor && editor.isFocused) {
      if (event.target === event.currentTarget) {
         editor.chain().focus('end').run();
      }
    }
  };

  return (
    <div
      className={cn(
        'w-full max-w-3xl mx-auto p-8 md:p-12 rounded-xl shadow-xl min-h-[60vh] flex flex-col transition-colors duration-300 relative', // Added relative for canvas positioning
        themeClassMap[pageTheme]
      )}
    >
      <input
        type="text"
        value={noteTitle}
        onChange={(e) => onNoteTitleChange(e.target.value)}
        className="font-headline text-3xl md:text-4xl mb-6 pb-2 border-b border-[hsl(var(--line-color))] bg-transparent focus:outline-none w-full placeholder-muted-foreground"
        placeholder="Untitled Note"
        disabled={isDrawingMode}
      />
      <div
        className={cn(
          'flex-1 relative flex flex-col min-h-0', 
          backgroundClassMap[backgroundStyle]
        )}
        onClick={handlePaperClick}
      >
        <EditorContent
          editor={editor}
          className={cn(
            "flex-1 tiptap-editor",
            isDrawingMode ? 'pointer-events-none' : '' // Prevent interaction with Tiptap when drawing
          )}
        />
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute top-0 left-0 w-full h-full",
            isDrawingMode ? 'pointer-events-auto z-10' : 'pointer-events-none -z-10' // Control canvas interaction
          )}
        />
      </div>
    </div>
  );
};

export default PageEditor;
