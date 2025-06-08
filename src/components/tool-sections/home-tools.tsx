
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  Heading1,
  Heading2,
  Heading3,
  Baseline,
  Highlighter,
  Strikethrough,
  Subscript,
  Superscript,
  Code2,
  Quote,
  Link as LinkIcon,
  ListOrdered,
  CheckSquare,
  Table2,
  Minus,
  ChevronsUpDown,
  ImageUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeToolsProps {
  editorRef: React.RefObject<Editor | null>;
}

const HomeTools: React.FC<HomeToolsProps> = ({ editorRef }) => {
  const [, setForceUpdateKey] = useState(0);
  const editor = editorRef.current;

  useEffect(() => {
    const currentEditor = editorRef.current;
    if (currentEditor) {
      const handleUpdate = () => {
        setForceUpdateKey(k => k + 1);
      };
      
      currentEditor.on('transaction', handleUpdate);
      currentEditor.on('selectionUpdate', handleUpdate);
      
      handleUpdate(); // Initial update

      return () => {
        currentEditor.off('transaction', handleUpdate);
        currentEditor.off('selectionUpdate', handleUpdate);
      };
    }
  }, [editorRef, editor]); // Re-run if editor instance itself changes (e.g. from null to editor)

  if (!editor) {
    return <div className="flex justify-center items-center h-full w-full"><p className="text-muted-foreground text-sm">Editor loading...</p></div>;
  }

  const isButtonActive = (type: string, options?: Record<string, any>) => editor.isActive(type, options);

  const toolGroups = [
    // Basic Formatting
    [
      {
        icon: <Bold />,
        label: 'Bold',
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: () => isButtonActive('bold'),
      },
      {
        icon: <Italic />,
        label: 'Italic',
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: () => isButtonActive('italic'),
      },
      {
        icon: <Underline />,
        label: 'Underline',
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: () => isButtonActive('underline'),
      },
      {
        icon: <Strikethrough />,
        label: 'Strikethrough',
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: () => isButtonActive('strike'),
      },
      { icon: <Highlighter />, label: 'Highlight (NA)', action: () => {}, isActive: () => false },
    ],
    // Headings
    [
      {
        icon: <Heading1 />,
        label: 'Heading 1',
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: () => isButtonActive('heading', { level: 1 }),
      },
      {
        icon: <Heading2 />,
        label: 'Heading 2',
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: () => isButtonActive('heading', { level: 2 }),
      },
      {
        icon: <Heading3 />,
        label: 'Heading 3',
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: () => isButtonActive('heading', { level: 3 }),
      },
      { icon: <Baseline />, label: 'Font Color (NA)', action: () => {}, isActive: () => false },
    ],
    // Advanced Text Styles (Placeholders for future implementation)
    [
      { icon: <Subscript />, label: 'Subscript (NA)', action: () => {}, isActive: () => false },
      { icon: <Superscript />, label: 'Superscript (NA)', action: () => {}, isActive: () => false },
    ],
    // Content Blocks
    [
      {
        icon: <Quote />,
        label: 'Blockquote',
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: () => isButtonActive('blockquote'),
      },
      {
        icon: <Code2 />,
        label: 'Code Block',
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        isActive: () => isButtonActive('codeBlock'),
      },
      { icon: <LinkIcon />, label: 'Insert Link (NA)', action: () => {}, isActive: () => false },
    ],
    // Lists
    [
      {
        icon: <List />,
        label: 'Bulleted List',
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: () => isButtonActive('bulletList'),
      },
      {
        icon: <ListOrdered />,
        label: 'Numbered List',
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: () => isButtonActive('orderedList'),
      },
      { icon: <CheckSquare />, label: 'Checklist (NA)', action: () => {}, isActive: () => false },
      { icon: <AlignLeft />, label: 'Align Left (NA)', action: () => {}, isActive: () => false },
    ],
    // Insertions
    [
      { icon: <Table2 />, label: 'Insert Table (NA)', action: () => {}, isActive: () => false },
      {
        icon: <Minus />,
        label: 'Horizontal Rule',
        action: () => editor.chain().focus().setHorizontalRule().run(),
        isActive: () => false, 
      },
      { icon: <ChevronsUpDown />, label: 'Toggle Section (NA)', action: () => {}, isActive: () => false },
      { icon: <ImageUp />, label: 'Insert Image (NA)', action: () => {}, isActive: () => false },
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
              disabled={tool.label.includes('(NA)')}
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
