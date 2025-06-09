
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import UnderlineExtension from '@tiptap/extension-underline';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import TextAlignExtension from '@tiptap/extension-text-align';
import SuperscriptExtension from '@tiptap/extension-superscript';
import SubscriptExtension from '@tiptap/extension-subscript';
import TextStyleExtension from '@tiptap/extension-text-style';
import ColorExtension from '@tiptap/extension-color';
import HighlightExtension from '@tiptap/extension-highlight';
import ImageExtension from '@tiptap/extension-image';
import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';


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
  editorTiptapRef?: React.MutableRefObject<Editor | null>;
  isDrawingMode: boolean;
  currentDrawTool: string | null;
  drawColor: string;
  drawStrokeWidth: number;
}

export interface PageEditorRef {
  clearCanvas: () => void;
}

const PageEditor = forwardRef<PageEditorRef, PageEditorProps>(({
  noteTitle,
  onNoteTitleChange,
  noteContent,
  onNoteChange,
  backgroundStyle,
  pageTheme,
  editorTiptapRef,
  isDrawingMode,
  currentDrawTool,
  drawColor,
  drawStrokeWidth,
}, ref) => {
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
        gapcursor: false, // Recommended for better cursor behavior near nodes
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
      TextStyleExtension,
      ColorExtension,
      HighlightExtension.configure({ multicolor: true }),
      ImageExtension.configure({
        allowBase64: true,
      }),
      TaskListExtension,
      TaskItemExtension.configure({
        nested: true,
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

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        const tempImageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        if (tempImageData && canvas.width > 0 && canvas.height > 0) {
         try {
            canvas.getContext('2d')?.putImageData(tempImageData, 0, 0);
          } catch (e) {
            // This can happen if the canvas was previously 0x0, then tempImageData is invalid
            // console.error("Error restoring canvas data after resize:", e);
            // In this case, just clear the canvas as data is lost
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0,0, canvas.width, canvas.height);
            }
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    // Initial resize needs to happen after the layout is stable
    const timeoutId = setTimeout(resizeCanvas, 0); 
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(timeoutId);
    };
  }, [resizeCanvas]);


  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }));

  useEffect(() => {
    if (editor && editorTiptapRef) {
      editorTiptapRef.current = editor;
    }
    return () => {
      if (editorTiptapRef) {
        editorTiptapRef.current = null;
      }
    };
  }, [editor, editorTiptapRef]);

  useEffect(() => {
    if (editor && editor.isEditable && editor.getHTML() !== noteContent) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(noteContent, false);
      try {
        const docSize = editor.state.doc.content.size;
        const newFrom = Math.min(from, docSize);
        const newTo = Math.min(to, docSize);
        if (newFrom <= docSize && newTo <= docSize) {
          editor.commands.setTextSelection({ from: newFrom, to: newTo });
        } else {
          editor.commands.setTextSelection(editor.state.doc.content.size);
        }
      } catch (e) {
        editor.commands.setTextSelection(editor.state.doc.content.size);
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
    if (!canvas) return;

    if (!isDrawingMode || !(currentDrawTool === 'pen' || currentDrawTool === 'eraser')) {
      setIsPainting(false); // Ensure painting state is reset
      return;
    }
    
    // Ensure canvas is sized correctly for the drawing session
    resizeCanvas();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configure context for the current tool
    if (currentDrawTool === 'pen') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawStrokeWidth;
    } else if (currentDrawTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = drawStrokeWidth; // Eraser size uses strokeWidth
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

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
      event.preventDefault();
      const pos = getMousePosition(event);
      if (!pos) return;

      // Re-apply context settings for safety, in case they were changed elsewhere
      // or if startPaint is called without the main effect re-running (though unlikely with current deps)
      if (currentDrawTool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = drawColor;
        ctx.lineWidth = drawStrokeWidth;
      } else if (currentDrawTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = drawStrokeWidth;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      setIsPainting(true);
      setLastPosition(pos);
      
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const paint = (event: MouseEvent | TouchEvent) => {
      event.preventDefault();
      if (!isPainting || !lastPosition) return; // Check lastPosition as well
      
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
      ctx.closePath(); // closePath might not be necessary for just lines, but doesn't harm
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
  }, [isDrawingMode, currentDrawTool, drawColor, drawStrokeWidth, resizeCanvas]); // Added resizeCanvas to deps


  const handlePaperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawingMode || (event.target as HTMLElement).closest('.ProseMirror')) {
      return;
    }
  
    if (editor) {
       if (event.target === event.currentTarget ) { // Only focus if the click is on the paper itself, not its children (like ProseMirror)
         editor.chain().focus('end').run();
       }
    }
  };
  
  return (
    <div
      className={cn(
        'w-full max-w-3xl mx-auto p-8 md:p-12 rounded-xl shadow-xl min-h-[60vh] flex flex-col transition-colors duration-300 relative',
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
            "flex-1 tiptap-editor", // tiptap-editor ensures it can grow
            isDrawingMode ? 'pointer-events-none opacity-70' : '' 
          )}
        />
        <canvas
          ref={canvasRef}
          className={cn(
            "absolute top-0 left-0 w-full h-full", 
            isDrawingMode && (currentDrawTool === 'pen' || currentDrawTool === 'eraser') ? 'pointer-events-auto z-10' : 'pointer-events-none -z-10'
          )}
        />
      </div>
    </div>
  );
});

PageEditor.displayName = 'PageEditor';
export default PageEditor;

