
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link as LinkIcon,
  Baseline, 
  Superscript,
  Subscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Eraser, 
  Undo2, 
  Redo2, 
  Minus, 
  CheckSquare, 
  Table2, 
  ChevronsUpDown, 
  ImageUp, 
  Highlighter, 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeToolsProps {
  editorRef: React.RefObject<Editor | null>;
}

const HomeTools: React.FC<HomeToolsProps> = ({ editorRef }) => {
  const [, setForceUpdateKey] = useState(0); // Hook 1: useState
  const editor = editorRef.current; // Get current editor instance for dependencies

  // Hook 2: useEffect - setups listeners and forces update for button states
  useEffect(() => {
    const currentEditorInstance = editorRef.current; // Use the ref's current value inside the effect
    if (currentEditorInstance) {
      const handleUpdate = () => {
        setForceUpdateKey(k => k + 1); 
      };
      
      currentEditorInstance.on('transaction', handleUpdate);
      currentEditorInstance.on('selectionUpdate', handleUpdate);
      
      handleUpdate(); // Initial update for button states

      return () => {
        currentEditorInstance.off('transaction', handleUpdate);
        currentEditorInstance.off('selectionUpdate', handleUpdate);
      };
    }
  }, [editorRef, editor]); // Re-run when editor instance (editor) becomes available or editorRef itself changes.
                           // Simplified to [editor] if editor = editorRef.current is stable for effect definition.
                           // Using [editorRef, editor] is safer if editorRef could be a new ref object.


  // Hook 3: useCallback for handleLink - defined unconditionally
  const handleLink = useCallback(() => {
    const currentEditor = editorRef.current; // Always use the ref's current value inside callbacks
    if (!currentEditor) {
      console.warn("handleLink called when editor is not available");
      return;
    }
    const previousUrl = currentEditor.getAttributes('link').href;
    // Prompt for URL, allow empty string to remove link
    const url = window.prompt('Enter URL (leave empty to remove link):', previousUrl || '');

    if (url === null) { // User pressed cancel
      return;
    }
    if (url === '') { // User wants to remove the link
      currentEditor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    // Apply the link
    currentEditor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editorRef]); // Dependency on editorRef (stable ref object)

  // Conditional rendering: If editor is not yet available, show loading.
  // This is now AFTER all hook calls.
  if (!editor) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <p className="text-muted-foreground text-sm">Editor loading...</p>
      </div>
    );
  }

  // Helper function, not a hook, defined after editor is confirmed to exist.
  const isButtonActive = (type: string, options?: Record<string, any>): boolean => {
    return editor.isActive(type, options);
  };

  const toolGroups = [
    // Basic Text Formatting
    [
      { icon: <Bold />, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: () => isButtonActive('bold') },
      { icon: <Italic />, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => isButtonActive('italic') },
      { icon: <Underline />, label: 'Underline', action: () => editor.chain().focus().toggleUnderline().run(), isActive: () => isButtonActive('underline') },
      { icon: <Strikethrough />, label: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), isActive: () => isButtonActive('strike') },
      { icon: <Superscript />, label: 'Superscript', action: () => editor.chain().focus().toggleSuperscript().run(), isActive: () => isButtonActive('superscript') },
      { icon: <Subscript />, label: 'Subscript', action: () => editor.chain().focus().toggleSubscript().run(), isActive: () => isButtonActive('subscript') },
    ],
    // Headings & Color
    [
      { icon: <Heading1 />, label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => isButtonActive('heading', { level: 1 }) },
      { icon: <Heading2 />, label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => isButtonActive('heading', { level: 2 }) },
      { icon: <Heading3 />, label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => isButtonActive('heading', { level: 3 }) },
      { icon: <Baseline />, label: 'Font Color (Red)', action: () => editor.chain().focus().setColor('#E03131').run(), isActive: () => editor.isActive('textStyle', { color: '#E03131' }) },
      { icon: <Highlighter />, label: 'Highlight (NA)', action: () => {}, isActive: () => false, disabled: true },
    ],
    // Alignment
    [
      { icon: <AlignLeft />, label: 'Align Left', action: () => editor.chain().focus().setTextAlign('left').run(), isActive: () => isButtonActive({ textAlign: 'left' }) },
      { icon: <AlignCenter />, label: 'Align Center', action: () => editor.chain().focus().setTextAlign('center').run(), isActive: () => isButtonActive({ textAlign: 'center' }) },
      { icon: <AlignRight />, label: 'Align Right', action: () => editor.chain().focus().setTextAlign('right').run(), isActive: () => isButtonActive({ textAlign: 'right' }) },
      { icon: <AlignJustify />, label: 'Align Justify', action: () => editor.chain().focus().setTextAlign('justify').run(), isActive: () => isButtonActive({ textAlign: 'justify' }) },
    ],
    // Lists & Blocks
    [
      { icon: <List />, label: 'Bulleted List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => isButtonActive('bulletList') },
      { icon: <ListOrdered />, label: 'Numbered List', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => isButtonActive('orderedList') },
      { icon: <Quote />, label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => isButtonActive('blockquote') },
      { icon: <Code2 />, label: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: () => isButtonActive('codeBlock') },
    ],
    // Insertions & Links
    [
      { icon: <LinkIcon />, label: 'Insert Link', action: handleLink, isActive: () => isButtonActive('link') },
      { icon: <Minus />, label: 'Horizontal Rule', action: () => editor.chain().focus().setHorizontalRule().run(), isActive: () => false },
      { icon: <CheckSquare />, label: 'Checklist (NA)', action: () => {}, isActive: () => false, disabled: true },
      { icon: <Table2 />, label: 'Insert Table (NA)', action: () => {}, isActive: () => false, disabled: true },
      { icon: <ImageUp />, label: 'Insert Image (NA)', action: () => {}, isActive: () => false, disabled: true },
      { icon: <ChevronsUpDown />, label: 'Toggle Section (NA)', action: () => {}, isActive: () => false, disabled: true },
    ],
    // Formatting & History
    [
      { icon: <Eraser />, label: 'Clear Formatting', action: () => editor.chain().focus().unsetAllMarks().clearNodes().run(), isActive: () => false },
      { icon: <Undo2 />, label: 'Undo', action: () => editor.chain().focus().undo().run(), isActive: () => false, disabled: !editor.can().undo() },
      { icon: <Redo2 />, label: 'Redo', action: () => editor.chain().focus().redo().run(), isActive: () => false, disabled: !editor.can().redo() },
    ],
  ];

  return (
    <div className="flex flex-wrap gap-1 items-center justify-center">
      {toolGroups.map((group, groupIndex) => (
        <React.Fragment key={groupIndex}>
          {group.map((tool) => (
            <Button
              variant="ghost"
              size="icon"
              key={tool.label}
              onClick={tool.action}
              aria-label={tool.label}
              title={tool.label}
              className={cn(
                'hover:bg-accent/50',
                tool.isActive() ? 'bg-accent text-accent-foreground' : ''
              )}
              disabled={tool.disabled || (tool.label.includes('(NA)')) || !editor.isEditable} // Disable if editor not editable
            >
              {tool.icon}
            </Button>
          ))}
          {groupIndex < toolGroups.length - 1 && (
            <Separator orientation="vertical" className="h-6 mx-1" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default HomeTools;
