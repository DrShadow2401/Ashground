
'use client';

import React from 'react';
import { NodeViewWrapper, type NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import interact from 'interactjs';
import type { Interactable } from '@interactjs/core/Interactable';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ImageComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, selected, editor, getPos }) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const resizableImageContainerRef = React.useRef<HTMLDivElement>(null);
  // imgRef is not strictly necessary anymore for interact.js but can be kept if needed for other direct img manipulations
  // const imgRef = React.useRef<HTMLImageElement>(null);


  const { src, alt, title, width } = node.attrs;

  // Draggable logic for the NodeViewWrapper
  React.useEffect(() => {
    const wrapperElement = wrapperRef.current;
    if (!wrapperElement) return;

    const interactable: Interactable = interact(wrapperElement);

    if (editor.isEditable && selected) {
      wrapperElement.style.cursor = 'grab';
      let currentX = node.attrs.offsetX || 0;
      let currentY = node.attrs.offsetY || 0;

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
      if (wrapperElement) {
        wrapperElement.style.cursor = 'default';
        // Ensure transform is based on attributes if not selected or editable
        wrapperElement.style.transform = `translateX(${node.attrs.offsetX || 0}px) translateY(${node.attrs.offsetY || 0}px)`;
      }
    }
    
    return () => {
      interactable.unset();
    };
  }, [selected, editor.isEditable, updateAttributes, node.attrs.offsetX, node.attrs.offsetY, editor]);


  // Resizable logic for the resizableImageContainerRef
  React.useEffect(() => {
    const imageContainerElement = resizableImageContainerRef.current;
    if (!imageContainerElement) return;

    const resizableInteractable: Interactable = interact(imageContainerElement);

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
              // Height of the inner img is auto, so container height is also auto based on img
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
      resizableInteractable.resizable(false); 
    }
    
    return () => {
      resizableInteractable.unset();
    };
  }, [selected, editor.isEditable, updateAttributes, node.attrs.width, editor]);

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
    position: 'relative', // For positioning delete button and ensuring wrapper can be dragged
    display: 'inline-block', // To match previous inline-block behavior
  };
  
  const imageContainerStyle: React.CSSProperties = {
    width: width ? `${width}px` : 'auto',
    // height is auto based on img content to maintain aspect ratio
    position: 'relative', // For outline and potentially for interact.js handles if they are children
    touchAction: (selected && editor.isEditable) ? 'none' : 'auto',
    display: 'inline-block', // Or 'block' if preferred, matching the wrapper's display intent
  };


  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className={cn("resizable-image-node-wrapper", node.attrs.className)} // Changed class name for clarity
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
      <div
        ref={resizableImageContainerRef}
        className={cn(
            'rounded', // Keep rounded corners
            selected && editor.isEditable ? 'outline-accent outline-2 outline-dashed outline-offset-2' : ''
        )}
        style={imageContainerStyle}
      >
        <img
          // ref={imgRef} // Not strictly needed if not directly manipulating img for resize
          src={src}
          alt={alt || ''}
          title={title || ''}
          style={{
            width: '100%', // Image fills the resizable container
            height: 'auto',
            display: 'block', 
          }}
          draggable="false" 
        />
      </div>
    </NodeViewWrapper>
  );
};

export const getResizableImageNodeView = () => ReactNodeViewRenderer(ImageComponent);

