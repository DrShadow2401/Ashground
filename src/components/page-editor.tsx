
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
import OriginalImageExtension from '@tiptap/extension-image';
import { getResizableImageNodeView } from '@/components/resizable-image-node-view';

import TaskListExtension from '@tiptap/extension-task-list';
import TaskItemExtension from '@tiptap/extension-task-item';

import type { LineStyle } from '@/app/ashground-app';
import { cn } from '@/lib/utils';

type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';


const CustomImageExtension = OriginalImageExtension.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => {
          const widthAttr = element.getAttribute('width');
          if (widthAttr && /^\d+$/.test(widthAttr)) return parseInt(widthAttr, 10);
          const styleWidth = element.style.width;
          if (styleWidth && styleWidth.endsWith('px')) return parseInt(styleWidth.replace('px',''), 10);
          return null;
        },
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return { style: `width: ${attributes.width}px; height: auto; max-width: 100%; display: block;` };
        },
      },
      height: { 
        default: null,
        parseHTML: _element => null,
        renderHTML: _attributes => ({}), 
      },
      offsetX: {
        default: 0,
      },
      offsetY: {
        default: 0,
      },
    };
  },
  addNodeView() {
    return getResizableImageNodeView();
  },
}).configure({
  allowBase64: true,
  inline: false,
});


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
  onDrawColorChange: (color: string) => void;
  onUndoStateChange: (canUndo: boolean) => void; // Callback for undo availability
}

export interface PageEditorRef {
  clearCanvas: () => void;
  getExportableElement: () => HTMLDivElement | null;
  undoDrawing: () => void; // Method to trigger undo
}

const MAX_CANVAS_HISTORY_SIZE = 20;

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
  onUndoStateChange,
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
    CustomImageExtension, 
    TaskListExtension,
    TaskItemExtension.configure({
      nested: true,
    }),
  ], [placeholderText]);

  const handleEditorUpdate = useCallback(({ editor: tiptapEditor }: { editor: Editor }) => {
    if (tiptapEditor.isDestroyed) return;
    onNoteChange(tiptapEditor.getHTML());
  }, [onNoteChange]);

  const editorTiptapProps = useMemo(() => ({
    attributes: {
      class: 'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl focus:outline-none w-full',
    },
  }), []);

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: noteContent,
    onUpdate: handleEditorUpdate,
    editorProps: editorTiptapProps,
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPaintingRef = useRef(false);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [canvasKey, setCanvasKey] = useState(Date.now());
  const exportableAreaRef = useRef<HTMLDivElement>(null);

  // Refs for drawing history
  const canvasHistoryRef = useRef<string[]>([]);
  const currentCanvasHistoryIndexRef = useRef<number>(-1); 
  const currentCanvasDataUrlRef = useRef<string | null>(null); // Holds current visual state for resize

  const updateUndoButtonState = useCallback(() => {
    const canUndo = currentCanvasHistoryIndexRef.current > 0 && canvasHistoryRef.current.length > 0;
    onUndoStateChange(canUndo);
  }, [onUndoStateChange]);

  const saveCanvasState = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;

    try {
      const dataUrl = canvas.toDataURL();
      
      if (currentCanvasHistoryIndexRef.current < canvasHistoryRef.current.length - 1) {
        canvasHistoryRef.current = canvasHistoryRef.current.slice(0, currentCanvasHistoryIndexRef.current + 1);
      }

      canvasHistoryRef.current.push(dataUrl);
      currentCanvasHistoryIndexRef.current = canvasHistoryRef.current.length - 1;

      if (canvasHistoryRef.current.length > MAX_CANVAS_HISTORY_SIZE) {
        canvasHistoryRef.current.shift(); 
        currentCanvasHistoryIndexRef.current--; 
      }
      currentCanvasDataUrlRef.current = dataUrl;
      updateUndoButtonState();
    } catch (e) {
      console.error("Error saving canvas state:", e);
    }
  }, [updateUndoButtonState]);


  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = exportableAreaRef.current;
    if (canvas && container && canvas.parentElement) {
        const parent = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const newWidth = parent.clientWidth;
        const newHeight = parent.clientHeight;

        if (canvas.width !== newWidth * dpr || canvas.height !== newHeight * dpr) {
            canvas.width = newWidth * dpr;
            canvas.height = newHeight * dpr;
            canvas.style.width = `${newWidth}px`;
            canvas.style.height = `${newHeight}px`;

            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.scale(dpr, dpr);
                canvasContextRef.current = ctx;

                if (currentCanvasDataUrlRef.current && currentCanvasDataUrlRef.current !== "cleared") {
                    const img = new Image();
                    img.onload = () => {
                        ctx.clearRect(0, 0, newWidth, newHeight); 
                        ctx.drawImage(img, 0, 0, newWidth, newHeight);
                    };
                    img.onerror = (e) => console.error("Error loading image data for canvas restore:", e);
                    img.src = currentCanvasDataUrlRef.current;
                } else {
                    ctx.clearRect(0, 0, newWidth, newHeight);
                }
            }
        }
    }
  }, []); 

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && exportableAreaRef.current && canvas.parentElement) {
        const parent = canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        
        // Set initial dimensions based on parent
        if (canvas.width === 0 || canvas.height === 0) { // Only if not already set
            canvas.width = parent.clientWidth * dpr;
            canvas.height = parent.clientHeight * dpr;
            canvas.style.width = `${parent.clientWidth}px`;
            canvas.style.height = `${parent.clientHeight}px`;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
            if (!canvasContextRef.current) { // Scale only once
                 ctx.scale(dpr, dpr);
            }
            canvasContextRef.current = ctx;
            
            if (canvasHistoryRef.current.length === 0) { 
                const blankDataUrl = canvas.toDataURL();
                canvasHistoryRef.current = [blankDataUrl];
                currentCanvasHistoryIndexRef.current = 0;
                currentCanvasDataUrlRef.current = blankDataUrl;
                updateUndoButtonState();
            } else if (currentCanvasDataUrlRef.current && currentCanvasDataUrlRef.current !== "cleared") {
                // Restore if history exists (e.g. theme change)
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0,0, parent.clientWidth, parent.clientHeight);
                    ctx.drawImage(img, 0, 0, parent.clientWidth, parent.clientHeight);
                };
                img.src = currentCanvasDataUrlRef.current;
            }
        }
    }
    
    const timeoutId = setTimeout(resizeCanvas, 50); // Ensure dimensions are stable
    window.addEventListener('resize', resizeCanvas);
    return () => {
        window.removeEventListener('resize', resizeCanvas);
        clearTimeout(timeoutId);
    };
  }, [resizeCanvas, updateUndoButtonState, pageTheme, backgroundStyle]); // Rerun on theme/bg change for canvas redraw


  useImperativeHandle(ref, () => ({
    clearCanvas: () => {
      const canvas = canvasRef.current;
      const ctx = canvasContextRef.current;
      if (ctx && canvas) {
        const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
        const logicalHeight = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, logicalWidth, logicalHeight);
        
        currentCanvasDataUrlRef.current = canvas.toDataURL(); // Capture blank state
        canvasHistoryRef.current = [currentCanvasDataUrlRef.current];
        currentCanvasHistoryIndexRef.current = 0;
        updateUndoButtonState();
        setCanvasKey(Date.now());
      }
    },
    getExportableElement: () => exportableAreaRef.current,
    undoDrawing: () => {
      if (currentCanvasHistoryIndexRef.current > 0) {
          currentCanvasHistoryIndexRef.current--;
          const canvas = canvasRef.current;
          const ctx = canvasContextRef.current;
          const dataUrl = canvasHistoryRef.current[currentCanvasHistoryIndexRef.current];

          if (canvas && ctx && dataUrl) {
              const img = new Image();
              img.onload = () => {
                  const logicalWidth = canvas.width / (window.devicePixelRatio || 1);
                  const logicalHeight = canvas.height / (window.devicePixelRatio || 1);
                  ctx.clearRect(0, 0, logicalWidth, logicalHeight);
                  ctx.drawImage(img, 0, 0, logicalWidth, logicalHeight);
                  currentCanvasDataUrlRef.current = dataUrl;
                  updateUndoButtonState();
              };
              img.onerror = (e) => console.error("Error loading image data for undo:", e);
              img.src = dataUrl;
          }
      }
    },
  }), [saveCanvasState, updateUndoButtonState]); // Added saveCanvasState

  useEffect(() => {
    if (editor && !editor.isDestroyed && editorTiptapRef) {
      editorTiptapRef.current = editor;
      if (onEditorReady && editor.isEditable) onEditorReady(editor);
    }
    return () => {
      if (editorTiptapRef) {
        editorTiptapRef.current = null;
      }
    };
  }, [editor, editorTiptapRef, onEditorReady]);

  useEffect(() => {
    if (editor && !editor.isDestroyed && editor.getHTML() !== noteContent) {
      const { from, to } = editor.state.selection;
      // Do not check editor.isEditable here for programmatic updates
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
    if (editor && !editor.isDestroyed) {
      editor.setEditable(!isDrawingMode);
    }
  }, [isDrawingMode, editor]);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // resizeCanvas(); // Called from initial effect now

    if (!isDrawingMode || !currentDrawTool) {
      isPaintingRef.current = false;
      return;
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
    // Handle dark theme auto-color inversion more explicitly if needed for eraser
    if (pageTheme === 'dark' && (drawColor.toLowerCase() === '#000000' || drawColor.toLowerCase() === '#000')) {
      if (currentDrawTool !== 'eraser') { // Eraser doesn't use color
        effectiveDrawColor = '#FFFFFF';
      }
    }


    const handlePaintMove = (event: MouseEvent | TouchEvent) => {
      if (!isPaintingRef.current || !lastPositionRef.current || !ctx ) return;
      if (!(event instanceof MouseEvent && event.buttons === 1) && !(event instanceof TouchEvent)) {
        if (event instanceof MouseEvent) {
            handlePaintEnd();
            return;
        }
      }
      event.preventDefault();

      const pos = getEventPosition(event);
      if (!pos) return;

      ctx.lineWidth = drawStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (currentDrawTool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = effectiveDrawColor;
      } else if (currentDrawTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        // Eraser doesn't use strokeStyle color, but might need to set lineWidth
      }


      if (currentLineStyle === 'dashed' && currentDrawTool === 'pen') {
          ctx.setLineDash([10, 5]);
      } else if (currentLineStyle === 'dotted' && currentDrawTool === 'pen') {
          ctx.setLineDash([drawStrokeWidth, drawStrokeWidth * 2]);
      } else {
          ctx.setLineDash([]); // Solid line for pen, or default for eraser
      }
      
      if (currentDrawTool === 'pen' || currentDrawTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(lastPositionRef.current.x, lastPositionRef.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastPositionRef.current = pos;
      }
    };

    const handlePaintEnd = () => {
      if (!isPaintingRef.current) return;
      isPaintingRef.current = false;
      
      window.removeEventListener('mousemove', handlePaintMove);
      window.removeEventListener('mouseup', handlePaintEnd);
      window.removeEventListener('touchmove', handlePaintMove);
      window.removeEventListener('touchend', handlePaintEnd);
      window.removeEventListener('touchcancel', handlePaintEnd);

      if (currentDrawTool === 'pen' || currentDrawTool === 'eraser') {
         saveCanvasState();
      }
       ctx.setLineDash([]);
       // Reset composite operation if it was changed by eraser
       if (ctx.globalCompositeOperation === 'destination-out') {
           ctx.globalCompositeOperation = 'source-over';
       }
    };
    
    const handlePaintStart = (event: MouseEvent | TouchEvent) => {
      if (!(event.target === canvas) || !currentDrawTool || (event instanceof MouseEvent && event.button !== 0)) return;
      event.preventDefault();
      
      const pos = getEventPosition(event);
      if (!pos || !ctx) return;
      
      // resizeCanvas(); // Ensure canvas is sized before drawing. Called from initial effect.
      
      ctx.lineWidth = drawStrokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (currentDrawTool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = effectiveDrawColor;
        ctx.fillStyle = effectiveDrawColor; // For dot if drawing single points
      } else if (currentDrawTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        // No specific color for eraser, it "removes" content
      }


      if (currentLineStyle === 'dashed' && currentDrawTool === 'pen') {
          ctx.setLineDash([10, 5]);
      } else if (currentLineStyle === 'dotted' && currentDrawTool === 'pen') {
          ctx.setLineDash([drawStrokeWidth, drawStrokeWidth * 2]);
      } else {
          ctx.setLineDash([]);
      }

      if (currentDrawTool === 'pen' || currentDrawTool === 'eraser') {
        isPaintingRef.current = true;
        lastPositionRef.current = pos;
        
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x, pos.y); // Draw a dot for single clicks
        ctx.stroke();

        window.addEventListener('mousemove', handlePaintMove, { passive: false });
        window.addEventListener('mouseup', handlePaintEnd);
        window.addEventListener('touchmove', handlePaintMove, { passive: false });
        window.addEventListener('touchend', handlePaintEnd);
        window.addEventListener('touchcancel', handlePaintEnd);
      } 
    };

    canvas.addEventListener('mousedown', handlePaintStart);
    canvas.addEventListener('touchstart', handlePaintStart, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handlePaintStart);
      canvas.removeEventListener('touchstart', handlePaintStart);
      
      window.removeEventListener('mousemove', handlePaintMove);
      window.removeEventListener('mouseup', handlePaintEnd);
      window.removeEventListener('touchmove', handlePaintMove);
      window.removeEventListener('touchend', handlePaintEnd);
      window.removeEventListener('touchcancel', handlePaintEnd);

      if (isPaintingRef.current && (currentDrawTool === 'pen' || currentDrawTool === 'eraser')) { 
         saveCanvasState();
      }
      isPaintingRef.current = false;
      if (ctx && ctx.globalCompositeOperation === 'destination-out') { // Reset on cleanup if tool was eraser
         ctx.globalCompositeOperation = 'source-over';
      }
    };
  }, [isDrawingMode, currentDrawTool, drawColor, drawStrokeWidth, pageTheme, onDrawColorChange, currentLineStyle, saveCanvasState]);


  const handlePaperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDrawingMode || (event.target as HTMLElement).closest('.ProseMirror')) {
      return;
    }
    if (editor && !editor.isDestroyed && event.target === event.currentTarget) {
      editor.chain().focus('end').run();
    }
  };

  return (
    <div
      id="page-editor-export-area"
      ref={exportableAreaRef}
      className={cn(
        'w-full min-h-full p-6 sm:p-8 md:p-10 rounded-xl shadow-xl flex flex-col transition-colors duration-300 relative',
        themeClassMap[pageTheme]
      )}
    >
      <input
        type="text"
        value={noteTitle}
        onChange={(e) => onNoteTitleChange(e.target.value)}
        className="font-headline text-3xl md:text-4xl mb-2 pb-2 border-b border-[hsl(var(--line-h,0),var(--line-s,0%),var(--line-l,0%),var(--line-a,0.7))] bg-transparent focus:outline-none w-full placeholder-muted-foreground"
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
            "flex-1 tiptap-editor relative z-[5]", 
            isDrawingMode ? 'pointer-events-none opacity-70' : ''
          )}
        />
        <canvas
          key={canvasKey} 
          ref={canvasRef}
          className={cn(
            "absolute top-0 left-0 w-full h-full",
            isDrawingMode && currentDrawTool ? 'pointer-events-auto z-[10]' : 'pointer-events-none z-[1]'
          )}
          style={{ touchAction: isDrawingMode && currentDrawTool ? 'none' : 'auto' }}
        />
      </div>
    </div>
  );
});

PageEditor.displayName = 'PageEditor';
export default PageEditor;
