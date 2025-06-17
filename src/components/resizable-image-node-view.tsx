
'use client';

import React from 'react';
import { NodeViewWrapper, NodeViewProps, ReactNodeViewRenderer } from '@tiptap/react';
import interact from 'interactjs';
import { cn } from '@/lib/utils';

const ImageComponent: React.FC<NodeViewProps> = ({ node, updateAttributes, selected, editor }) => {
  const imgRef = React.useRef<HTMLImageElement>(null);
  // Ensure attributes are correctly accessed, providing defaults if necessary
  const src = node.attrs.src || '';
  const alt = node.attrs.alt || '';
  const title = node.attrs.title || '';
  const width = node.attrs.width;


  React.useEffect(() => {
    const imageElement = imgRef.current;
    if (!imageElement || !editor.isEditable) return;

    let interactInstance: interact.Interactable | null = null;

    if (selected) {
      interactInstance = interact(imageElement)
        .resizable({
          edges: { left: true, right: true, bottom: true, top: true },
          inertia: false,
          modifiers: [
            interact.modifiers.restrictSize({
              min: { width: 50 }, // Min width, height will be auto
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
                height: null, // Clear height to maintain aspect ratio based on new width
              });
            },
          },
        });
    }

    return () => {
      if (interactInstance) {
        interactInstance.unset();
        // Reset styles if interact.js modified them directly and instance is destroyed
        // This might be needed if Tiptap doesn't fully overwrite on next render
        if (imageElement) {
            imageElement.style.width = width ? `${width}px` : 'auto';
            imageElement.style.height = 'auto';
        }
      }
    };
  // editor.isEditable and updateAttributes are stable. `selected` and `width` are key dependencies.
  }, [selected, editor.isEditable, updateAttributes, width]);

  return (
    <NodeViewWrapper className={cn("resizable-image-wrapper inline-block", node.attrs.className)}>
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        title={title}
        style={{
          width: width ? `${width}px` : 'auto',
          height: 'auto',
          display: 'block', // Important for sizing and layout
          cursor: selected && editor.isEditable ? 'grab' : 'default',
        }}
        className={cn(
            'rounded',
            selected && editor.isEditable ? 'outline-accent outline-2 outline-dashed outline-offset-2' : ''
        )}
        draggable="false" // Prevent native image drag when interact.js is active
      />
    </NodeViewWrapper>
  );
};

export const getResizableImageNodeView = () => ReactNodeViewRenderer(ImageComponent);
