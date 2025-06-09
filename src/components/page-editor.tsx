
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
  const isPaintingRef = useRef(false);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const [canvasKey, setCanvasKey] = useState(0); // Used to force re-render/re-capture of canvas for resize

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        // Capture the current drawing BEFORE resizing
        let currentDrawingDataUrl: string | null = null;
        if (canvas.width > 0 && canvas.height > 0) {
            try {
                currentDrawingDataUrl = canvas.toDataURL();
            } catch (e) {
                // console.error("Error capturing canvas data URL:", e);
                currentDrawingDataUrl = null; // Fallback if canvas is tainted or too large
            }
        }

        const newWidth = parent.clientWidth;
        const newHeight = parent.clientHeight;

        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.width = newWidth;
          canvas.height = newHeight;
          const ctx = canvas.getContext('2d');
          canvasContextRef.current = ctx; // Update context ref

          if (ctx) {
            ctx.clearRect(0, 0, newWidth, newHeight); // Clear new canvas first
            if (currentDrawingDataUrl && newWidth > 0 && newHeight > 0) {
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
              };
              img.src = currentDrawingDataUrl;
            }
          }
        }
      }
    }
  }, []);


  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    const timeoutId = setTimeout(resizeCanvas, 0);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(timeoutId);
    };
  }, [resizeCanvas]);


  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const ctx = canvasContextRef.current; // Use stored context
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Force re-capture for resize logic by changing key if necessary, or ensure resize uses cleared state
        setCanvasKey(prevKey => prevKey + 1); 
      }
    }
  }), [canvasContextRef]);

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
    if (!canvas || !isDrawingMode || !(currentDrawTool === 'pen' || currentDrawTool === 'eraser')) {
      isPaintingRef.current = false; // Ensure painting stops if mode changes
      return;
    }
    
    // Ensure canvas is sized correctly when drawing mode activates
    resizeCanvas(); 
    // Store and re-use the context
    if (!canvasContextRef.current) {
        canvasContextRef.current = canvas.getContext('2d');
    }
    const ctx = canvasContextRef.current;
    if (!ctx) return;


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
      if (!(event.target === canvas)) return; // Only paint if event is directly on canvas
      event.preventDefault();
      
      const pos = getMousePosition(event);
      if (!pos || !ctx) return;

      isPaintingRef.current = true;
      lastPositionRef.current = pos;

      // Apply tool-specific context settings
      if (currentDrawTool === 'pen') {
        let effectiveDrawColor = drawColor;
        if (pageTheme === 'dark' && (drawColor.toLowerCase() === '#000000' || drawColor.toLowerCase() === '#000')) {
          effectiveDrawColor = '#FFFFFF';
        }
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = effectiveDrawColor;
        ctx.lineWidth = drawStrokeWidth;
      } else if (currentDrawTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = drawStrokeWidth;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);

      // Add window event listeners for robust mouse/touch tracking
      window.addEventListener('mousemove', paint);
      window.addEventListener('mouseup', endPaint);
      window.addEventListener('touchmove', paint, { passive: false });
      window.addEventListener('touchend', endPaint);
      window.addEventListener('touchcancel', endPaint);
    };

    const paint = (event: MouseEvent | TouchEvent) => {
      if (!isPaintingRef.current || !lastPositionRef.current || !ctx) return;
      // For touch events, check if target is canvas to avoid drawing when scrolling page
      if (event instanceof TouchEvent && !(event.target === canvas)) {
         // return; // This might be too aggressive, could prevent drawing if touch starts on canvas and moves slightly off.
      }
      event.preventDefault(); // Prevent scrolling while drawing on touch devices
      
      const pos = getMousePosition(event);
      if (!pos) return;

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPositionRef.current = pos;
    };

    const endPaint = () => {
      if (!isPaintingRef.current) return;
      isPaintingRef.current = false;
      lastPositionRef.current = null;
      if (ctx) {
          ctx.closePath();
      }
      
      // Remove window event listeners
      window.removeEventListener('mousemove', paint);
      window.removeEventListener('mouseup', endPaint);
      window.removeEventListener('touchmove', paint);
      window.removeEventListener('touchend', endPaint);
      window.removeEventListener('touchcancel', endPaint);
    };

    // Attach only mousedown/touchstart to the canvas itself
    canvas.addEventListener('mousedown', startPaint);
    canvas.addEventListener('touchstart', startPaint, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', startPaint);
      canvas.removeEventListener('touchstart', startPaint);
      
      // Clean up window listeners if component unmounts while painting
      window.removeEventListener('mousemove', paint);
      window.removeEventListener('mouseup', endPaint);
      window.removeEventListener('touchmove', paint);
      window.removeEventListener('touchend', endPaint);
      window.removeEventListener('touchcancel', endPaint);
    };
  }, [isDrawingMode, currentDrawTool, drawColor, drawStrokeWidth, pageTheme, resizeCanvas]);


  const handlePaperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawingMode || (event.target as HTMLElement).closest('.ProseMirror')) {
      return;
    }
  
    if (editor) {
       if (event.target === event.currentTarget ) { 
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
            "flex-1 tiptap-editor", 
            isDrawingMode ? 'pointer-events-none opacity-70' : '' 
          )}
        />
        <canvas
          key={canvasKey} // Using key to help with re-initialization if needed
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
    