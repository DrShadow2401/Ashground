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

import type { LineStyle } from '@/app/page';
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
  currentLineStyle: LineStyle;
  onEditorReady?: (editor: Editor) => void;
  onDrawColorChange: (color: string) => void; // For eyedropper
  onAfterColorPick: () => void; // For eyedropper
}

export interface PageEditorRef {
  clearCanvas: () => void;
}

const drawShape = (ctx: CanvasRenderingContext2D, pos: {x: number, y: number}, tool: string, strokeWidth: number, color: string, lineStyle: LineStyle) => {
  const size = 20 + strokeWidth * 2; 
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (lineStyle === 'dashed') {
    ctx.setLineDash([10, 5]);
  } else if (lineStyle === 'dotted') {
    ctx.setLineDash([strokeWidth, strokeWidth * 2]); // Adjust for better dot appearance
  } else {
    ctx.setLineDash([]);
  }
  
  ctx.beginPath();
  switch (tool) {
    case 'circle':
      ctx.arc(pos.x, pos.y, size / 2, 0, Math.PI * 2);
      break;
    case 'square':
      ctx.rect(pos.x - size / 2, pos.y - size / 2, size, size);
      break;
    case 'triangle':
      ctx.moveTo(pos.x, pos.y - size / 2);
      ctx.lineTo(pos.x + size / 2, pos.y + size / 2);
      ctx.lineTo(pos.x - size / 2, pos.y + size / 2);
      ctx.closePath();
      break;
    case 'line': 
      ctx.moveTo(pos.x - size / 1.5, pos.y);
      ctx.lineTo(pos.x + size / 1.5, pos.y);
      break;
    case 'arrow': 
      ctx.moveTo(pos.x - size / 1.5, pos.y);
      ctx.lineTo(pos.x + size / 1.5, pos.y);
      ctx.moveTo(pos.x + size / 1.5, pos.y);
      ctx.lineTo(pos.x + size / 1.5 - (strokeWidth + 4), pos.y - (strokeWidth + 4));
      ctx.moveTo(pos.x + size / 1.5, pos.y);
      ctx.lineTo(pos.x + size / 1.5 - (strokeWidth + 4), pos.y + (strokeWidth + 4));
      break;
  }
  ctx.stroke();
  ctx.setLineDash([]); // Reset line dash after drawing shape
};


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
  currentLineStyle,
  onEditorReady,
  onDrawColorChange,
  onAfterColorPick,
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
  const [canvasKey, setCanvasKey] = useState(Date.now()); 
  const currentCanvasDataUrlRef = useRef<string | null>(null);


  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        let drawingDataUrlToRestore = currentCanvasDataUrlRef.current;

        // If canvas exists and has dimensions, capture its current state before resizing
        // unless we intend to clear it (e.g., after clearCanvas call)
        if (canvas.width > 0 && canvas.height > 0 && drawingDataUrlToRestore !== "cleared") {
          try {
            drawingDataUrlToRestore = canvas.toDataURL();
          } catch (e) {
            console.error("Error capturing canvas data URL for resize:", e);
            drawingDataUrlToRestore = null; 
          }
        }
        
        const newWidth = parent.clientWidth;
        const newHeight = parent.clientHeight;

        if (canvas.width !== newWidth || canvas.height !== newHeight) {
          canvas.width = newWidth;
          canvas.height = newHeight;
          const ctx = canvas.getContext('2d');
          canvasContextRef.current = ctx;

          if (ctx) {
            ctx.clearRect(0, 0, newWidth, newHeight);
            if (drawingDataUrlToRestore && drawingDataUrlToRestore !== "cleared" && newWidth > 0 && newHeight > 0) {
              const img = new Image();
              img.onload = () => {
                ctx.drawImage(img, 0, 0);
              };
              img.onerror = () => {
                console.error("Error loading image data for canvas restore.");
              }
              img.src = drawingDataUrlToRestore;
            }
          }
        }
        // After resize, if it was 'cleared', reset ref so next resize doesn't use 'cleared'
        if (currentCanvasDataUrlRef.current === "cleared") {
            currentCanvasDataUrlRef.current = null;
        } else if (drawingDataUrlToRestore && drawingDataUrlToRestore !== "cleared") {
            currentCanvasDataUrlRef.current = drawingDataUrlToRestore;
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
      const ctx = canvasContextRef.current;
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        currentCanvasDataUrlRef.current = "cleared"; // Signal that canvas was intentionally cleared
        setCanvasKey(Date.now()); // Force re-init if needed for some edge cases
      }
    }
  }), []);

  useEffect(() => {
    if (editor && editorTiptapRef) {
      editorTiptapRef.current = editor;
      if(onEditorReady) onEditorReady(editor);
    }
    return () => {
      if (editorTiptapRef) {
        editorTiptapRef.current = null;
      }
    };
  }, [editor, editorTiptapRef, onEditorReady]);

  useEffect(() => {
    if (editor && editor.isEditable && editor.getHTML() !== noteContent) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(noteContent, false);
      try {
        const docSize = editor.state.doc.content.size;
        editor.commands.setTextSelection({ from: Math.min(from, docSize), to: Math.min(to, docSize) });
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
    if (!canvas || !isDrawingMode || !currentDrawTool ) {
      isPaintingRef.current = false;
      return;
    }
    
    resizeCanvas(); // Ensure canvas is sized correctly when drawing mode activates/tool changes

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
    
    const paint = (event: MouseEvent | TouchEvent) => {
      if (!isPaintingRef.current || !lastPositionRef.current || !ctx || currentDrawTool !== 'pen') return;
      event.preventDefault();
      
      const pos = getMousePosition(event);
      if (!pos) return;

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPositionRef.current = pos;
    };

    const endPaint = () => {
      if (!isPaintingRef.current) return;
      isPaintingRef.current = false;
      if (ctx) ctx.closePath();
      
      window.removeEventListener('mousemove', paint);
      window.removeEventListener('mouseup', endPaint);
      window.removeEventListener('touchmove', paint);
      window.removeEventListener('touchend', endPaint);
      window.removeEventListener('touchcancel', endPaint);
      // After drawing, capture the state
      if (canvas.width > 0 && canvas.height > 0) {
        try { currentCanvasDataUrlRef.current = canvas.toDataURL(); } catch (e) { /* ignore */ }
      }
    };
    
    const startPaint = (event: MouseEvent | TouchEvent) => {
      if (!(event.target === canvas) || !currentDrawTool) return;
      event.preventDefault();
      
      const pos = getMousePosition(event);
      if (!pos || !ctx) return;

      let effectiveDrawColor = drawColor;
      if (pageTheme === 'dark' && (drawColor.toLowerCase() === '#000000' || drawColor.toLowerCase() === '#000')) {
        effectiveDrawColor = '#FFFFFF';
      }
      
      ctx.strokeStyle = effectiveDrawColor;
      ctx.fillStyle = effectiveDrawColor; // For eyedropper (though it reads, not sets fill)
      ctx.lineWidth = drawStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentLineStyle === 'dashed') {
        ctx.setLineDash([10, 5]);
      } else if (currentLineStyle === 'dotted') {
        // Make dots scale with stroke width for better appearance
        ctx.setLineDash([drawStrokeWidth, drawStrokeWidth * 2]);
      } else {
        ctx.setLineDash([]); // Solid line
      }


      if (currentDrawTool === 'pen' || currentDrawTool === 'eraser') {
        isPaintingRef.current = true;
        lastPositionRef.current = pos;
        ctx.globalCompositeOperation = currentDrawTool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);

        window.addEventListener('mousemove', paint, { passive: false });
        window.addEventListener('mouseup', endPaint);
        window.addEventListener('touchmove', paint, { passive: false });
        window.addEventListener('touchend', endPaint);
        window.addEventListener('touchcancel', endPaint);

      } else if (currentDrawTool === 'eyedropper') {
          const pixelData = ctx.getImageData(pos.x, pos.y, 1, 1).data;
          const hexColor = `#${("000000" + ((pixelData[0] << 16) | (pixelData[1] << 8) | pixelData[2]).toString(16)).slice(-6)}`;
          onDrawColorChange(hexColor);
          onAfterColorPick(); // This should deselect the eyedropper tool
      } else if (['circle', 'square', 'triangle', 'line', 'arrow'].includes(currentDrawTool)) {
        ctx.globalCompositeOperation = 'source-over'; 
        drawShape(ctx, pos, currentDrawTool, drawStrokeWidth, effectiveDrawColor, currentLineStyle);
        isPaintingRef.current = false; 
         if (canvas.width > 0 && canvas.height > 0) {
            try { currentCanvasDataUrlRef.current = canvas.toDataURL(); } catch (e) { /* ignore */ }
        }
      }
       // Reset line dash for subsequent operations outside this specific drawing action if needed
      // However, it's better to set it at the start of each drawing operation.
      // ctx.setLineDash([]); 
    };


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
      isPaintingRef.current = false; // Ensure painting stops if drawing mode is exited
    };
  }, [isDrawingMode, currentDrawTool, drawColor, drawStrokeWidth, pageTheme, resizeCanvas, onDrawColorChange, onAfterColorPick, currentLineStyle]);


  const handlePaperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawingMode || (event.target as HTMLElement).closest('.ProseMirror')) {
      return;
    }
    if (editor && event.target === event.currentTarget) { 
      editor.chain().focus('end').run();
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
          key={canvasKey}
          ref={canvasRef}
          className={cn(
            "absolute top-0 left-0 w-full h-full", 
            isDrawingMode && (currentDrawTool) ? 'pointer-events-auto z-10' : 'pointer-events-none -z-10'
          )}
          style={{ touchAction: isDrawingMode && currentDrawTool ? 'none' : 'auto' }} 
        />
      </div>
    </div>
  );
});

PageEditor.displayName = 'PageEditor';
export default PageEditor;
    
