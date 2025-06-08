
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft, // Retained for completeness, though Tiptap handles alignment differently
  Heading1,
  Heading2,
  Heading3, // Added Heading2 and Heading3 icons
  Baseline, // For Font Color (placeholder)
  Highlighter, // For Highlighting (placeholder)
  Strikethrough,
  Subscript, // (placeholder)
  Superscript, // (placeholder)
  Code2, // For Code Block / Inline Code (Tiptap handles both)
  Quote, // For Blockquote
  Link as LinkIcon, // For Hyperlinks (placeholder)
  ListOrdered,
  CheckSquare, // For Checklists (placeholder)
  Table2, // For Tables (placeholder)
  Minus, // For Horizontal Rules
  ChevronsUpDown, // For Collapsible Sections (placeholder)
  ImageUp, // For Image Insertion (placeholder)
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeToolsProps {
  editor: Editor | null;
}

const HomeTools: React.FC<HomeToolsProps> = ({ editor }) => {
  if (!editor) {
    return null; // Or a loading/disabled state
  }

  const isButtonActive = (type: string, options?: Record<string, any>) => editor.isActive(type, options);

  const toolGroups = [
    // Basic Formatting
    [
      {
        icon: <Bold />,
        label: 'Bold',
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: ()_ => isButtonActive('bold'),
      },
      {
        icon: <Italic />,
        label: 'Italic',
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: ()_ => isButtonActive('italic'),
      },
      {
        icon: <Underline />,
        label: 'Underline',
        action: () => editor.chain().focus().toggleUnderline().run(),
        isActive: ()_ => isButtonActive('underline'),
      },
      {
        icon: <Strikethrough />,
        label: 'Strikethrough',
        action: () => editor.chain().focus().toggleStrike().run(),
        isActive: ()_ => isButtonActive('strike'),
      },
      { icon: <Highlighter />, label: 'Highlight (NA)', action: () => {}, isActive: () => false },
    ],
    // Headings
    [
      {
        icon: <Heading1 />,
        label: 'Heading 1',
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: ()_ => isButtonActive('heading', { level: 1 }),
      },
      {
        icon: <Heading2 />,
        label: 'Heading 2',
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: ()_ => isButtonActive('heading', { level: 2 }),
      },
      {
        icon: <Heading3 />,
        label: 'Heading 3',
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: ()_ => isButtonActive('heading', { level: 3 }),
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
        isActive: ()_ => isButtonActive('blockquote'),
      },
      {
        icon: <Code2 />,
        label: 'Code Block',
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        isActive: ()_ => isButtonActive('codeBlock'),
      },
      { icon: <LinkIcon />, label: 'Insert Link (NA)', action: () => {}, isActive: () => false },
    ],
    // Lists
    [
      {
        icon: <List />,
        label: 'Bulleted List',
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: ()_ => isButtonActive('bulletList'),
      },
      {
        icon: <ListOrdered />,
        label: 'Numbered List',
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: ()_ => isButtonActive('orderedList'),
      },
      { icon: <CheckSquare />, label: 'Checklist (NA)', action: () => {}, isActive: () => false },
      { icon: <AlignLeft />, label: 'Align Left (NA)', action: () => {}, isActive: () => false }, // Text alignment needs Tiptap extension
    ],
    // Insertions
    [
      { icon: <Table2 />, label: 'Insert Table (NA)', action: () => {}, isActive: () => false },
      {
        icon: <Minus />,
        label: 'Horizontal Rule',
        action: () => editor.chain().focus().setHorizontalRule().run(),
        isActive: ()_ => false, // Horizontal rule doesn't have an "active" state in this context
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
              disabled={tool.label.includes('(NA)')} // Disable not implemented tools
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
