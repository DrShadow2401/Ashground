
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
  const initialOffsetX = node.attrs.offsetX || 0;
  const initialOffsetY = node.attrs.offsetY || 0;

  // Draggable logic for the wrapper
  React.useEffect(() => {
    const wrapperElement = wrapperRef.current;
    if (!wrapperElement || !editor.isEditable) {
      if (interact.isSet(wrapperElement)) {
        interact(wrapperElement).unset();
      }
      // Reset cursor if interact instance is removed
      if (wrapperElement) wrapperElement.style.cursor = 'default';
      return;
    }

    if (!selected) {
        if (interact.isSet(wrapperElement)) {
           interact(wrapperElement).draggable(false); // Disable draggable when not selected
        }
        if (wrapperElement) wrapperElement.style.cursor = 'default';
        return;
    }
    
    // If selected and editable, enable draggable
    if (wrapperElement) wrapperElement.style.cursor = 'grab';


    let currentX = initialOffsetX;
    let currentY = initialOffsetY;

    const interactInstance = interact(wrapperElement)
      .draggable({
        inertia: false,
        enabled: selected && editor.isEditable, // Ensure only draggable when selected and editable
        listeners: {
          start() {
            currentX = node.attrs.offsetX || 0; // Re-fetch on start, in case of external updates
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
              wrapperElement.style.cursor = selected && editor.isEditable ? 'grab' : 'default';
            }
          },
        },
      });
    
    return () => {
      if (interact.isSet(wrapperElement)) {
        interactInstance.unset();
      }
       if (wrapperElement) wrapperElement.style.cursor = 'default';
    };
  }, [selected, editor.isEditable, updateAttributes, initialOffsetX, initialOffsetY, node.attrs.offsetX, node.attrs.offsetY]);


  // Resizable logic for the image element itself
  React.useEffect(() => {
    const imageElement = imgRef.current;
    if (!imageElement || !editor.isEditable) {
      if (interact.isSet(imageElement)) {
        interact(imageElement).unset();
      }
      return;
    }
    
    if (!selected) {
        if (interact.isSet(imageElement)) {
            interact(imageElement).resizable(false); // Disable resizable when not selected
        }
        return;
    }

    // If selected and editable, enable resizable
    const interactResizableInstance = interact(imageElement)
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        inertia: false,
        enabled: selected && editor.isEditable,
        modifiers: [
          interact.modifiers.restrictSize({
            min: { width: 50 },
          }),
        ],
        listeners: {
          move(event) {
            imageElement.style.width = `${event.rect.width}px`;
            imageElement.style.height = 'auto';
          },
          end(event) {
            updateAttributes({
              width: Math.round(event.rect.width),
              height: null,
            });
          },
        },
      });
    
    return () => {
        if(interact.isSet(imageElement)){
            interactResizableInstance.unset();
        }
    };
  }, [selected, editor.isEditable, updateAttributes, width]);

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent other click handlers
    if (editor.isEditable) {
      const nodePosition = getPos();
      editor.chain().focus().deleteRange({ from: nodePosition, to: nodePosition + node.nodeSize }).run();
    }
  };

  const wrapperStyle: React.CSSProperties = {
    transform: `translateX(${initialOffsetX}px) translateY(${initialOffsetY}px)`,
    position: 'relative', // For positioning the delete button
    // Cursor is handled by the draggable useEffect
  };

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className={cn("resizable-image-wrapper inline-block", node.attrs.className)}
      style={wrapperStyle}
    >
      {selected && editor.isEditable && (
        <button
          onClick={handleDelete}
          className="absolute -top-2.5 -right-2.5 z-10 p-1 bg-card border border-destructive text-destructive rounded-full shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
          aria-label="Delete image"
          title="Delete image"
          type="button"
        >
          <X size={14} strokeWidth={2.5}/>
        </button>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        title={title}
        style={{
          width: width ? `${width}px` : 'auto',
          height: 'auto',
          display: 'block', // Important for sizing and layout
        }}
        className={cn(
            'rounded',
            selected && editor.isEditable ? 'outline-accent outline-2 outline-dashed outline-offset-2' : ''
        )}
        draggable="false" // Prevent native image drag
      />
    </NodeViewWrapper>
  );
};

export const getResizableImageNodeView = () => ReactNodeViewRenderer(ImageComponent);

