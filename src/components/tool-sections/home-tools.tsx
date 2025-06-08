
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
  const editor = editorRef.current; 
  const [, setForceUpdateKey] = useState(0); 

  useEffect(() => {
    const currentEditorInstance = editor;
    if (currentEditorInstance) {
      const handleUpdate = () => {
        setForceUpdateKey(k => k + 1); 
      };
      
      currentEditorInstance.on('transaction', handleUpdate);
      currentEditorInstance.on('selectionUpdate', handleUpdate);
      
      handleUpdate(); 

      return () => {
        currentEditorInstance.off('transaction', handleUpdate);
        currentEditorInstance.off('selectionUpdate', handleUpdate);
      };
    }
  }, [editor]); 


  const handleLink = useCallback(() => {
    const currentEditor = editorRef.current; // Use the latest ref
    if (!currentEditor) {
      console.warn("handleLink called when editor is not available");
      return;
    }
    const previousUrl = currentEditor.getAttributes('link').href;
    const url = window.prompt('Enter URL (leave empty to remove link):', previousUrl || '');

    if (url === null) { 
      return;
    }
    if (url === '') { 
      currentEditor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    currentEditor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editorRef]); // Depend on editorRef to ensure it's fresh if HomeTools re-renders for other reasons

  const handleImageInsert = useCallback(() => {
    const currentEditor = editorRef.current; // Use the latest ref
    if (!currentEditor) {
        console.warn("handleImageInsert called when editor is not available");
        return;
    }
    const url = window.prompt('Enter image URL:');
    if (url) {
      currentEditor.chain().focus().setImage({ src: url }).run();
    }
  }, [editorRef]); // Depend on editorRef

  if (!editor) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <p className="text-muted-foreground text-sm">Editor loading...</p>
      </div>
    );
  }

  const isButtonActive = (type: string, options?: Record<string, any>): boolean => {
    return editor.isActive(type, options);
  };

  const toolGroups = [
    [
      { icon: <Bold />, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: () => isButtonActive('bold') },
      { icon: <Italic />, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => isButtonActive('italic') },
      { icon: <Underline />, label: 'Underline', action: () => editor.chain().focus().toggleUnderline().run(), isActive: () => isButtonActive('underline') },
      { icon: <Strikethrough />, label: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), isActive: () => isButtonActive('strike') },
      { icon: <Superscript />, label: 'Superscript', action: () => editor.chain().focus().toggleSuperscript().run(), isActive: () => isButtonActive('superscript') },
      { icon: <Subscript />, label: 'Subscript', action: () => editor.chain().focus().toggleSubscript().run(), isActive: () => isButtonActive('subscript') },
    ],
    [
      { icon: <Heading1 />, label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => isButtonActive('heading', { level: 1 }) },
      { icon: <Heading2 />, label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => isButtonActive('heading', { level: 2 }) },
      { icon: <Heading3 />, label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => isButtonActive('heading', { level: 3 }) },
      { icon: <Baseline />, label: 'Font Color (Red)', action: () => editor.chain().focus().setColor('#E03131').run(), isActive: () => editor.isActive('textStyle', { color: '#E03131' }) },
      { icon: <Highlighter />, label: 'Highlight (Yellow)', action: () => editor.chain().focus().toggleHighlight({ color: '#FFF3A3' }).run(), isActive: () => editor.isActive('highlight', { color: '#FFF3A3' }) },
    ],
    [
      { icon: <AlignLeft />, label: 'Align Left', action: () => editor.chain().focus().setTextAlign('left').run(), isActive: () => isButtonActive({ textAlign: 'left' }) },
      { icon: <AlignCenter />, label: 'Align Center', action: () => editor.chain().focus().setTextAlign('center').run(), isActive: () => isButtonActive({ textAlign: 'center' }) },
      { icon: <AlignRight />, label: 'Align Right', action: () => editor.chain().focus().setTextAlign('right').run(), isActive: () => isButtonActive({ textAlign: 'right' }) },
      { icon: <AlignJustify />, label: 'Align Justify', action: () => editor.chain().focus().setTextAlign('justify').run(), isActive: () => isButtonActive({ textAlign: 'justify' }) },
    ],
    [
      { icon: <List />, label: 'Bulleted List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => isButtonActive('bulletList') },
      { icon: <ListOrdered />, label: 'Numbered List', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => isButtonActive('orderedList') },
      { icon: <Quote />, label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => isButtonActive('blockquote') },
      { icon: <Code2 />, label: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: () => isButtonActive('codeBlock') },
    ],
    [
      { icon: <LinkIcon />, label: 'Insert Link', action: handleLink, isActive: () => isButtonActive('link') },
      { icon: <Minus />, label: 'Horizontal Rule', action: () => editor.chain().focus().setHorizontalRule().run(), isActive: () => false },
      { icon: <CheckSquare />, label: 'Checklist', action: () => editor.chain().focus().toggleTaskList().run(), isActive: () => isButtonActive('taskList') },
      { icon: <Table2 />, label: 'Insert Table', action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), isActive: () => editor.isActive('table') },
      { icon: <ImageUp />, label: 'Insert Image', action: handleImageInsert, isActive: () => isButtonActive('image') },
      { icon: <ChevronsUpDown />, label: 'Toggle Section (NA)', action: () => {}, isActive: () => false, disabled: true },
    ],
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
              disabled={tool.disabled || !editor.isEditable}
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

    