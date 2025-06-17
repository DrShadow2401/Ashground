
'use client';

import React from 'react';
import { NodeViewWrapper, type NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import interact from 'interactjs';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ImageComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, selected, editor, getPos }) => {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  const { src, alt, title, width } = node.attrs;

  // Draggable logic for the wrapper
  React.useEffect(() => {
    const wrapperElement = wrapperRef.current;
    if (!wrapperElement) {
      return;
    }

    const interactable = interact(wrapperElement);

    if (editor.isEditable && selected) {
      wrapperElement.style.cursor = 'grab';
      let currentX = node.attrs.offsetX || 0;
      let currentY = node.attrs.offsetY || 0;

      // Set initial transform based on attributes
      wrapperElement.style.transform = `translateX(${currentX}px) translateY(${currentY}px)`;

      interactable.draggable({
        inertia: false,
        listeners: {
          start() {
            currentX = node.attrs.offsetX || 0;
            currentY = node.attrs.offsetY || 0;
            if (wrapperElement) wrapperElement.style.cursor = 'grabbing';
          },
          move(event) {
            currentX += event.dx;
            currentY += event.dy;
            if (wrapperElement) {
              wrapperElement.style.transform = `translateX(${currentX}px) translateY(${currentY}px)`;
            }
          },
          end() {
            updateAttributes({ offsetX: currentX, offsetY: currentY });
            if (wrapperElement) {
              wrapperElement.style.cursor = (editor.isEditable && selected) ? 'grab' : 'default';
            }
          },
        },
      });
    } else {
      interactable.draggable(false);
      if (wrapperElement) wrapperElement.style.cursor = 'default';
      // Ensure transform is based on attributes if not selected or editable
      if (wrapperElement) wrapperElement.style.transform = `translateX(${node.attrs.offsetX || 0}px) translateY(${node.attrs.offsetY || 0}px)`;
    }
    
    return () => {
      // Cleanup: unset the interactable instance
      interactable.unset();
    };
  }, [selected, editor.isEditable, updateAttributes, node.attrs.offsetX, node.attrs.offsetY, editor]);


  // Resizable logic for the image element itself
  React.useEffect(() => {
    const imageElement = imgRef.current;
    if (!imageElement) {
      return;
    }

    const resizableInteractable = interact(imageElement); // Get or create instance

    if (editor.isEditable && selected) {
      resizableInteractable.resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        inertia: false, 
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 50 }, 
          }),
        ],
        listeners: {
          move(event) {
            if (event.target instanceof HTMLElement) {
              event.target.style.width = `${event.rect.width}px`;
              event.target.style.height = 'auto'; 
            }
          },
          end(event) {
            updateAttributes({
              width: Math.round(event.rect.width),
              height: null, 
            });
          },
        },
      });
    } else {
      resizableInteractable.resizable(false); // Disable resizable
    }
    
    return () => {
      // Cleanup: unset the interactable instance
      resizableInteractable.unset();
    };
  }, [selected, editor.isEditable, updateAttributes, node.attrs.width, editor]); // Added node.attrs.width here

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); 
    if (editor.isEditable) {
      const nodePosition = getPos();
      if (typeof nodePosition === 'number' && nodePosition >= 0) {
        editor.chain().focus().deleteRange({ from: nodePosition, to: nodePosition + node.nodeSize }).run();
      }
    }
  };

  const wrapperStyle: React.CSSProperties = {
    transform: `translateX(${node.attrs.offsetX || 0}px) translateY(${node.attrs.offsetY || 0}px)`,
    position: 'relative', 
  };


  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className={cn("resizable-image-wrapper inline-block", node.attrs.className)}
      style={wrapperStyle}
      draggable="true" 
      data-drag-handle 
    >
      {selected && editor.isEditable && (
        <button
          onClick={handleDelete}
          className="absolute -top-2.5 -right-2.5 z-10 p-1 bg-card border border-destructive text-destructive rounded-full shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label="Delete image"
          title="Delete image"
          type="button"
          onMouseDown={(e) => e.stopPropagation()} 
        >
          <X size={14} strokeWidth={2.5}/>
        </button>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt || ''}
        title={title || ''}
        style={{
          width: width ? `${width}px` : 'auto',
          height: 'auto',
          display: 'block', 
          touchAction: (selected && editor.isEditable) ? 'none' : 'auto', // Added touch-action
        }}
        className={cn(
            'rounded',
            selected && editor.isEditable ? 'outline-accent outline-2 outline-dashed outline-offset-2' : ''
        )}
        draggable="false" 
      />
    </NodeViewWrapper>
  );
};

export const getResizableImageNodeView = () => ReactNodeViewRenderer(ImageComponent);

