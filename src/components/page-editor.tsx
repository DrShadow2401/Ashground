
import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
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

import type { LineStyle } from '@/app/ashground-app'; // Adjusted import path
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
  onEditorReady?: (editor: Editor) => void; // Changed to accept editor instance
  onDrawColorChange: (color: string) => void;
}

export interface PageEditorRef {
  clearCanvas: () => void;
  getExportableElement: () => HTMLDivElement | null;
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
  currentLineStyle,
  onEditorReady,
  onDrawColorChange,
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

  const tiptapExtensions = useMemo(() => [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
      gapcursor: false, // Consider if needed
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
      inline: false, // Explicitly block for resizability expectations
    }),
    TaskListExtension,
    TaskItemExtension.configure({
      nested: true,
    }),
  ], [placeholderText]); // placeholderText is constant, so extensions are memoized once

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: noteContent, // Initial content is set here
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
  const exportableAreaRef = useRef<HTMLDivElement>(null);


  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas && exportableAreaRef.current) {
        const parent = exportableAreaRef.current;
        const dpr = window.devicePixelRatio || 1;
        const newWidth = parent.clientWidth;
        const newHeight = parent.clientHeight;

        let drawingDataUrlToRestore: string | null = null;
        if (canvas.width > 0 && canvas.height > 0 && currentCanvasDataUrlRef.current !== "cleared") {
          try {
            drawingDataUrlToRestore = canvas.toDataURL();
          } catch (e) {
              console.error("Error capturing canvas data URL for resize:", e);
          }
        }


        if (canvas.width !== newWidth * dpr || canvas.height !== newHeight * dpr) {
            canvas.width = newWidth * dpr;
            canvas.height = newHeight * dpr;
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                canvasContextRef.current = ctx;
                ctx.clearRect(0, 0, newWidth, newHeight);

                if (drawingDataUrlToRestore && drawingDataUrlToRestore !== "cleared") {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    };
                    img.onerror = (e) => console.error("Error loading image data for canvas restore:", e);
                    img.src = drawingDataUrlToRestore;
                }
            }
        }
        if (currentCanvasDataUrlRef.current === "cleared") {
          currentCanvasDataUrlRef.current = null;
        } else if (drawingDataUrlToRestore && drawingDataUrlToRestore !== "cleared") {
           currentCanvasDataUrlRef.current = drawingDataUrlToRestore;
        }
    }
  }, []);


  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    const timeoutId = setTimeout(resizeCanvas, 50); // Initial resize after mount
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
        const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
        const logicalHeight = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        currentCanvasDataUrlRef.current = "cleared"; // Mark as cleared
        setCanvasKey(Date.now()); // Force re-render of canvas if needed
      }
    },
    getExportableElement: () => exportableAreaRef.current,
  }), []);

  useEffect(() => {
    if (editor && editorTiptapRef) {
      editorTiptapRef.current = editor;
      if (onEditorReady && editor.isEditable) onEditorReady(editor); // Pass editor instance
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
      editor.commands.setContent(noteContent, false); // emitUpdate = false
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
    if (!canvas) return;

    resizeCanvas(); // Initial resize for canvas context setup

    if (!isDrawingMode || !currentDrawTool) {
      isPaintingRef.current = false;
      return;
    }
    
    if (!canvasContextRef.current) { // Ensure context is established
        const ctx = canvas.getContext('2d');
        if (ctx) {
            const dpr = window.devicePixelRatio || 1;
            ctx.scale(dpr, dpr); // Scale once
            canvasContextRef.current = ctx;
        } else {
            return; // Cannot get context
        }
    }
    const ctx = canvasContextRef.current;
    if (!ctx) return;


    const getEventPosition = (event: MouseEvent | TouchEvent): { x: number; y: number } | null => {
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

    let effectiveDrawColor = drawColor;
    if (pageTheme === 'dark' && (drawColor.toLowerCase() === '#000000' || drawColor.toLowerCase() === '#000')) {
        effectiveDrawColor = '#FFFFFF'; // Draw white on dark theme if color is black
    }


    const handlePaintMove = (event: MouseEvent | TouchEvent) => {
      if (!isPaintingRef.current || !lastPositionRef.current || !ctx ) return;
      // Ensure painting only continues if primary mouse button is pressed (for mouse events)
      if (!(event instanceof MouseEvent && event.buttons === 1) && !(event instanceof TouchEvent)) {
        if (event instanceof MouseEvent) { // If mouse button is released mid-drag outside canvas
            handlePaintEnd();
            return;
        }
      }
      event.preventDefault(); // Prevent scrolling on touch devices

      const pos = getEventPosition(event);
      if (!pos) return;

      ctx.lineWidth = drawStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = effectiveDrawColor;
      ctx.globalCompositeOperation = 'source-over'; // Default drawing mode


      if (currentLineStyle === 'dashed') {
          ctx.setLineDash([10, 5]);
      } else if (currentLineStyle === 'dotted') {
          // For dotted, make dots relative to stroke width for better appearance
          ctx.setLineDash([drawStrokeWidth, drawStrokeWidth * 2]);
      } else { // Solid line
          ctx.setLineDash([]);
      }
      
      if (currentDrawTool === 'pen') {
        ctx.beginPath();
        ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPositionRef.current = pos;
      }
    };

    const handlePaintEnd = () => {
      if (!isPaintingRef.current) return; // Don't do anything if not painting
      isPaintingRef.current = false;
      
      // Clean up global event listeners
      window.removeEventListener('mousemove', handlePaintMove);
      window.removeEventListener('mouseup', handlePaintEnd);
      window.removeEventListener('touchmove', handlePaintMove);
      window.removeEventListener('touchend', handlePaintEnd);
      window.removeEventListener('touchcancel', handlePaintEnd);

      // Save canvas state as data URL if canvas is not empty
      if (canvas && canvas.width > 0 && canvas.height > 0) {
        try { currentCanvasDataUrlRef.current = canvas.toDataURL(); } catch (e) { console.error("Error saving canvas state:", e); }
      }
       ctx.setLineDash([]); // Reset line dash for other operations or next draw
    };
    
    const handlePaintStart = (event: MouseEvent | TouchEvent) => {
      if (!(event.target === canvas) || !currentDrawTool || (event instanceof MouseEvent && event.button !== 0)) return; // Only react to primary mouse button
      event.preventDefault(); // Prevent default actions like text selection or page scroll
      
      const pos = getEventPosition(event);
      if (!pos || !ctx) return; // No position or context, abort
      
      resizeCanvas(); // Ensure canvas is sized correctly before drawing start
      
      // Configure context for current tool
      ctx.lineWidth = drawStrokeWidth;
      ctx.lineCap = 'round'; // Smoother line ends
      ctx.lineJoin = 'round'; // Smoother line joins
      ctx.strokeStyle = effectiveDrawColor;
      ctx.fillStyle = effectiveDrawColor; // For tools that might fill
      ctx.globalCompositeOperation = 'source-over'; // Reset composite operation

      if (currentLineStyle === 'dashed') {
          ctx.setLineDash([10, 5]);
      } else if (currentLineStyle === 'dotted') {
          ctx.setLineDash([drawStrokeWidth, drawStrokeWidth * 2]);
      } else { // Solid
          ctx.setLineDash([]);
      }

      if (currentDrawTool === 'pen') {
        isPaintingRef.current = true;
        lastPositionRef.current = pos;
        
        // Draw a single dot for click-without-drag
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x, pos.y); // Tiny line to make a dot visible with lineCap='round'
        ctx.stroke();

        // Attach global listeners for move and end events
        window.addEventListener('mousemove', handlePaintMove, { passive: false });
        window.addEventListener('mouseup', handlePaintEnd);
        window.addEventListener('touchmove', handlePaintMove, { passive: false });
        window.addEventListener('touchend', handlePaintEnd);
        window.addEventListener('touchcancel', handlePaintEnd); // Handle touch interruptions

      } 
      // Eyedropper removed, so no 'else if' for it
    };

    // Attach start event listeners to the canvas itself
    canvas.addEventListener('mousedown', handlePaintStart);
    canvas.addEventListener('touchstart', handlePaintStart, { passive: false }); // passive:false to allow preventDefault

    // Cleanup function for the useEffect hook
    return () => {
      canvas.removeEventListener('mousedown', handlePaintStart);
      canvas.removeEventListener('touchstart', handlePaintStart);
      
      // Ensure global listeners are removed if effect re-runs or component unmounts while painting
      window.removeEventListener('mousemove', handlePaintMove);
      window.removeEventListener('mouseup', handlePaintEnd);
      window.removeEventListener('touchmove', handlePaintMove);
      window.removeEventListener('touchend', handlePaintEnd);
      window.removeEventListener('touchcancel', handlePaintEnd);
      // If painting was in progress, capture final state
      if (isPaintingRef.current) { 
        if (canvas && canvas.width > 0 && canvas.height > 0) {
            try { currentCanvasDataUrlRef.current = canvas.toDataURL(); } catch (e) { /* ignore error during cleanup */ }
        }
      }
      isPaintingRef.current = false; // Ensure painting state is reset
    };
  }, [isDrawingMode, currentDrawTool, drawColor, drawStrokeWidth, pageTheme, resizeCanvas, onDrawColorChange, currentLineStyle]);


  const handlePaperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // If in drawing mode, or if the click is inside the editor, do nothing.
    if (isDrawingMode || (event.target as HTMLElement).closest('.ProseMirror')) {
      return;
    }
    // If clicked on the paper area itself (not editor), focus the editor.
    if (editor && event.target === event.currentTarget) {
      editor.chain().focus('end').run();
    }
  };

  return (
    <div
      id="page-editor-export-area"
      ref={exportableAreaRef}
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
        disabled={isDrawingMode} // Disable title input when drawing
      />
      <div
        className={cn(
          'flex-1 relative flex flex-col min-h-0', // Ensure flex container for editor and canvas
          backgroundClassMap[backgroundStyle]
        )}
        onClick={handlePaperClick} // Click on paper to focus editor
      >
        <EditorContent
          editor={editor}
          className={cn(
            "flex-1 tiptap-editor", // tiptap-editor class to apply ProseMirror styles
            isDrawingMode ? 'pointer-events-none opacity-70' : '' // Disable editor interaction in drawing mode
          )}
        />
        {/* Drawing Canvas */}
        <canvas
          key={canvasKey} // Used to force re-render on clear
          ref={canvasRef}
          className={cn(
            "absolute top-0 left-0 w-full h-full", // Overlay canvas
            isDrawingMode && currentDrawTool ? 'pointer-events-auto z-10' : 'pointer-events-none -z-10' // Enable interaction only in draw mode
          )}
          // Conditionally set touch-action to prevent scrolling while drawing on touch devices
          style={{ touchAction: isDrawingMode && currentDrawTool ? 'none' : 'auto' }}
        />
      </div>
    </div>
  );
});

PageEditor.displayName = 'PageEditor';
export default PageEditor;

