
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  Superscript,
  Subscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  Minus,
  CheckSquare,
  ImageUp,
  Highlighter,
  Palette,
  ChevronsUpDown, // Placeholder for Toggle Section
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeToolsProps {
  editorRef: React.RefObject<Editor | null>;
}

const textColors = [
  { name: 'Default', value: '', icon: <Minus className="w-3 h-3 text-muted-foreground" /> },
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#E03131' },
  { name: 'Blue', value: '#2563EB' },
  { name: 'Green', value: '#16A34A' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Purple', value: '#7C3AED' },
  { name: 'Gray', value: '#6B7280' },
];

const highlightColors = [
    { name: 'Default', value: '', icon: <Minus className="w-3 h-3 text-muted-foreground" /> },
    { name: 'Yellow', value: '#FFF3A3' },
    { name: 'Pink', value: '#FECDD3' },
    { name: 'Green', value: '#A7F3D0' },
    { name: 'Blue', value: '#BFDBFE' },
];


const HomeTools: React.FC<HomeToolsProps> = ({ editorRef }) => {
  const editor = editorRef.current;
  const [, forceUpdate] = useState(0); // Renamed for clarity from setForceUpdateKey
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const currentEditorInstance = editor;
    if (currentEditorInstance) {
      const handleUpdate = () => {
        forceUpdate(k => k + 1);
      };
      currentEditorInstance.on('transaction', handleUpdate);
      currentEditorInstance.on('selectionUpdate', handleUpdate);
      // Removed problematic immediate handleUpdate() call from here
      return () => {
        currentEditorInstance.off('transaction', handleUpdate);
        currentEditorInstance.off('selectionUpdate', handleUpdate);
      };
    }
  }, [editor]); // forceUpdate is stable, dependency is effectively `editor`


  const handleImageInsert = useCallback(() => {
    imageFileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const currentEditor = editorRef.current;
    if (!currentEditor || !event.target.files?.[0]) return;

    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      currentEditor.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.readAsDataURL(file);
    if (event.target) { // Reset file input to allow selecting the same file again
        event.target.value = '';
    }
  }, [editorRef]);


  if (!editor) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <p className="text-muted-foreground text-sm">Editor loading...</p>
      </div>
    );
  }

  const isButtonActive = (type: string, options?: Record<string, any>): boolean => {
    if (!editor) return false;
    return editor.isActive(type, options);
  };

  const toolGroups = [
    [
      { type: 'button', icon: <Bold />, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: () => isButtonActive('bold') },
      { type: 'button', icon: <Italic />, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => isButtonActive('italic') },
      { type: 'button', icon: <Underline />, label: 'Underline', action: () => editor.chain().focus().toggleUnderline().run(), isActive: () => isButtonActive('underline') },
      { type: 'button', icon: <Strikethrough />, label: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), isActive: () => isButtonActive('strike') },
      { type: 'button', icon: <Superscript />, label: 'Superscript', action: () => editor.chain().focus().toggleSuperscript().run(), isActive: () => isButtonActive('superscript') },
      { type: 'button', icon: <Subscript />, label: 'Subscript', action: () => editor.chain().focus().toggleSubscript().run(), isActive: () => isButtonActive('subscript') },
    ],
    [
      { type: 'button', icon: <Heading1 />, label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => isButtonActive('heading', { level: 1 }) },
      { type: 'button', icon: <Heading2 />, label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => isButtonActive('heading', { level: 2 }) },
      { type: 'button', icon: <Heading3 />, label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => isButtonActive('heading', { level: 3 }) },
      {
        type: 'dropdown',
        icon: <Palette />,
        label: 'Font Color',
        items: textColors,
        action: (colorValue: string) => {
          if (colorValue === '') editor.chain().focus().unsetColor().run();
          else editor.chain().focus().setColor(colorValue).run();
        },
        isDropdownActive: () => !!editor.getAttributes('textStyle').color,
        isItemActive: (colorValue?: string) => colorValue ? editor.isActive('textStyle', { color: colorValue }) : !editor.getAttributes('textStyle').color && colorValue === '',
      },
      {
        type: 'dropdown',
        icon: <Highlighter />,
        label: 'Highlight Color',
        items: highlightColors,
        action: (colorValue: string) => {
            if (colorValue === '') editor.chain().focus().unsetHighlight().run();
            else editor.chain().focus().toggleHighlight({ color: colorValue }).run();
        },
        isDropdownActive: () => !!editor.getAttributes('highlight')?.color,
        isItemActive: (colorValue?: string) => {
          if (colorValue === '') return !editor.getAttributes('highlight')?.color && !editor.isActive('highlight');
          return editor.isActive('highlight', { color: colorValue });
        }
      },
    ],
    [
      { type: 'button', icon: <AlignLeft />, label: 'Align Left', action: () => editor.chain().focus().setTextAlign('left').run(), isActive: () => isButtonActive({ textAlign: 'left' }) },
      { type: 'button', icon: <AlignCenter />, label: 'Align Center', action: () => editor.chain().focus().setTextAlign('center').run(), isActive: () => isButtonActive({ textAlign: 'center' }) },
      { type: 'button', icon: <AlignRight />, label: 'Align Right', action: () => editor.chain().focus().setTextAlign('right').run(), isActive: () => isButtonActive({ textAlign: 'right' }) },
      { type: 'button', icon: <AlignJustify />, label: 'Align Justify', action: () => editor.chain().focus().setTextAlign('justify').run(), isActive: () => isButtonActive({ textAlign: 'justify' }) },
    ],
    [
      { type: 'button', icon: <List />, label: 'Bulleted List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => isButtonActive('bulletList') },
      { type: 'button', icon: <ListOrdered />, label: 'Numbered List', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => isButtonActive('orderedList') },
      { type: 'button', icon: <Quote />, label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => isButtonActive('blockquote') },
      { type: 'button', icon: <Code2 />, label: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: () => isButtonActive('codeBlock') },
    ],
    [
      { type: 'button', icon: <Minus />, label: 'Horizontal Rule', action: () => editor.chain().focus().setHorizontalRule().run(), isActive: () => false },
      { type: 'button', icon: <CheckSquare />, label: 'Checklist', action: () => editor.chain().focus().toggleTaskList().run(), isActive: () => isButtonActive('taskList') },
      { type: 'button', icon: <ImageUp />, label: 'Insert Image', action: handleImageInsert, isActive: () => false },
      { type: 'button', icon: <ChevronsUpDown />, label: 'Toggle Section (NA)', action: () => {}, isActive: () => false, disabled: true },
    ],
    [
      { type: 'button', icon: <Undo2 />, label: 'Undo', action: () => editor.chain().focus().undo().run(), isActive: () => false, disabled: !editor.can().undo() },
      { type: 'button', icon: <Redo2 />, label: 'Redo', action: () => editor.chain().focus().redo().run(), isActive: () => false, disabled: !editor.can().redo() },
    ],
  ];

  return (
    <>
      <input
        type="file"
        ref={imageFileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />
      <div className="flex flex-wrap gap-1 items-center justify-center">
        {toolGroups.map((group, groupIndex) => (
          <React.Fragment key={groupIndex}>
            {group.map((tool) => {
              if (tool.type === 'button') {
                return (
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
                    disabled={(tool as any).disabled || !editor.isEditable}
                  >
                    {tool.icon}
                  </Button>
                );
              }
              if (tool.type === 'dropdown' && tool.items) {
                return (
                  <DropdownMenu key={tool.label}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={tool.label}
                        title={tool.label}
                        className={cn(
                           'hover:bg-accent/50',
                           tool.isDropdownActive && tool.isDropdownActive() ? 'bg-accent text-accent-foreground' : ''
                        )}
                        disabled={!editor.isEditable}
                      >
                        {tool.icon}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuLabel>{tool.label}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {tool.items.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          onClick={() => tool.action(item.value)}
                          className={cn(
                            tool.isItemActive && tool.isItemActive(item.value) ? 'bg-accent/80' : ''
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {item.value ? (
                              <div
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: item.value,
                                         border: tool.label === 'Highlight Color' && item.value === '#FFF3A3' ? '1px solid #E0C567': '1px solid hsl(var(--border))'
                                        }}
                              />
                            ) : (
                              item.icon // For "Default" option with Minus icon
                            )}
                            {item.name}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              }
              return null;
            })}
            {groupIndex < toolGroups.length - 1 && (
              <Separator orientation="vertical" className="h-6 mx-1" />
            )}
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

export default HomeTools;
