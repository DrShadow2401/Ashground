
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
// import { Input } from '@/components/ui/input'; // Removed
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
  ImageUp,
  Highlighter,
  Palette,
  Feather,
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
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  const [isBoldActive, setIsBoldActive] = useState(false);
  const [isItalicActive, setIsItalicActive] = useState(false);
  const [isUnderlineActive, setIsUnderlineActive] = useState(false);
  const [isStrikeActive, setIsStrikeActive] = useState(false);
  const [isSuperscriptActive, setIsSuperscriptActive] = useState(false);
  const [isSubscriptActive, setIsSubscriptActive] = useState(false);
  const [currentHeadingLevel, setCurrentHeadingLevel] = useState<0 | 1 | 2 | 3>(0);
  const [currentTextColor, setCurrentTextColor] = useState<string | null>(null);
  const [currentHighlightColor, setCurrentHighlightColor] = useState<string | null>(null);
  const [currentTextAlign, setCurrentTextAlign] = useState<string | null>(null);
  const [isBulletListActive, setIsBulletListActive] = useState(false);
  const [isOrderedListActive, setIsOrderedListActive] = useState(false);
  const [isBlockquoteActive, setIsBlockquoteActive] = useState(false);
  const [isCodeBlockActive, setIsCodeBlockActive] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Removed imageWidthInput and isImageSelected states as they are no longer needed for the input field


  const allSetters = {
    setIsBoldActive, setIsItalicActive, setIsUnderlineActive, setIsStrikeActive,
    setIsSuperscriptActive, setIsSubscriptActive, setCurrentHeadingLevel,
    setCurrentTextColor, setCurrentHighlightColor, setCurrentTextAlign,
    setIsBulletListActive, setIsOrderedListActive, setIsBlockquoteActive,
    setIsCodeBlockActive, setCanUndo, setCanRedo,
  };


  const handleTransactionOrSelectionUpdate = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || editor.isDestroyed) return;

    allSetters.setIsBoldActive(editor.isActive('bold'));
    allSetters.setIsItalicActive(editor.isActive('italic'));
    allSetters.setIsUnderlineActive(editor.isActive('underline'));
    allSetters.setIsStrikeActive(editor.isActive('strike'));
    allSetters.setIsSuperscriptActive(editor.isActive('superscript'));
    allSetters.setIsSubscriptActive(editor.isActive('subscript'));

    if (editor.isActive('heading', { level: 1 })) allSetters.setCurrentHeadingLevel(1);
    else if (editor.isActive('heading', { level: 2 })) allSetters.setCurrentHeadingLevel(2);
    else if (editor.isActive('heading', { level: 3 })) allSetters.setCurrentHeadingLevel(3);
    else allSetters.setCurrentHeadingLevel(0);

    allSetters.setCurrentTextColor(editor.getAttributes('textStyle').color || null);
    const highlightAttrs = editor.getAttributes('highlight');
    allSetters.setCurrentHighlightColor(highlightAttrs?.color || null);
    
    if (editor.isActive({ textAlign: 'left' })) allSetters.setCurrentTextAlign('left');
    else if (editor.isActive({ textAlign: 'center' })) allSetters.setCurrentTextAlign('center');
    else if (editor.isActive({ textAlign: 'right' })) allSetters.setCurrentTextAlign('right');
    else if (editor.isActive({ textAlign: 'justify' })) allSetters.setCurrentTextAlign('justify');
    else allSetters.setCurrentTextAlign(null);

    allSetters.setIsBulletListActive(editor.isActive('bulletList'));
    allSetters.setIsOrderedListActive(editor.isActive('orderedList'));
    allSetters.setIsBlockquoteActive(editor.isActive('blockquote'));
    allSetters.setIsCodeBlockActive(editor.isActive('codeBlock'));

    allSetters.setCanUndo(editor.can().undo());
    allSetters.setCanRedo(editor.can().redo());

    // No need to update image specific states like isImageSelected for the input field
  }, [editorRef, allSetters]);


  useEffect(() => {
    const currentEditor = editorRef.current;
    if (!currentEditor || currentEditor.isDestroyed) {
      return;
    }
    
    handleTransactionOrSelectionUpdate(); // Initial check
    
    currentEditor.on('transaction', handleTransactionOrSelectionUpdate);
    currentEditor.on('selectionUpdate', handleTransactionOrSelectionUpdate);

    return () => {
      if (!currentEditor.isDestroyed) {
        currentEditor.off('transaction', handleTransactionOrSelectionUpdate);
        currentEditor.off('selectionUpdate', handleTransactionOrSelectionUpdate);
      }
    };
  }, [editorRef, handleTransactionOrSelectionUpdate]);


  const handleImageInsert = useCallback(() => {
    imageFileInputRef.current?.click();
  }, []);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const currentEditor = editorRef.current;
    if (!currentEditor || !event.target.files?.[0] || currentEditor.isDestroyed) return;

    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      // Insert image with default (auto) width initially
      currentEditor.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.readAsDataURL(file);
    if (event.target) {
        event.target.value = '';
    }
  }, [editorRef]);

  const handleLetterInsert = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || editor.isDestroyed) return;
    
    const letterTemplate = `
      <p style="text-align: right;">[Date]</p>
      <p>Dear [Recipient's Name],</p>
      <p>I am writing to you today to...</p>
      <p>[Body of the letter continues here.]</p>
      <p>Sincerely,<br>[Your Name]</p>
    `;
    
    editor.chain().focus().insertContent(letterTemplate).run();
  }, [editorRef]);

  const editor = editorRef.current;
  if (!editor || editor.isDestroyed) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <p className="text-muted-foreground text-sm">Editor loading...</p>
      </div>
    );
  }

  const toolGroups = [
    [
      { type: 'button', icon: <Bold />, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: () => isBoldActive },
      { type: 'button', icon: <Italic />, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => isItalicActive },
      { type: 'button', icon: <Underline />, label: 'Underline', action: () => editor.chain().focus().toggleUnderline().run(), isActive: () => isUnderlineActive },
      { type: 'button', icon: <Strikethrough />, label: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), isActive: () => isStrikeActive },
      { type: 'button', icon: <Superscript />, label: 'Superscript', action: () => editor.chain().focus().toggleSuperscript().run(), isActive: () => isSuperscriptActive },
      { type: 'button', icon: <Subscript />, label: 'Subscript', action: () => editor.chain().focus().toggleSubscript().run(), isActive: () => isSubscriptActive },
    ],
    [
      { type: 'button', icon: <Heading1 />, label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => currentHeadingLevel === 1 },
      { type: 'button', icon: <Heading2 />, label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => currentHeadingLevel === 2 },
      { type: 'button', icon: <Heading3 />, label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => currentHeadingLevel === 3 },
      {
        type: 'dropdown',
        icon: <Palette />,
        label: 'Font Color',
        items: textColors,
        action: (colorValue: string) => {
          if (editor.isDestroyed) return;
          if (colorValue === '') editor.chain().focus().unsetColor().run();
          else editor.chain().focus().setColor(colorValue).run();
        },
        isDropdownActive: () => !!currentTextColor,
        isItemActive: (colorValue?: string) => (colorValue ? currentTextColor === colorValue : !currentTextColor && colorValue === ''),
      },
      {
        type: 'dropdown',
        icon: <Highlighter />,
        label: 'Highlight Color',
        items: highlightColors,
        action: (colorValue: string) => {
            if (editor.isDestroyed) return;
            if (colorValue === '') editor.chain().focus().unsetHighlight().run();
            else editor.chain().focus().toggleHighlight({ color: colorValue }).run();
        },
        isDropdownActive: () => !!currentHighlightColor,
        isItemActive: (colorValue?: string) => {
          if (colorValue === '') return !currentHighlightColor && !editor.isActive('highlight');
          return currentHighlightColor === colorValue;
        }
      },
    ],
    [
      { type: 'button', icon: <AlignLeft />, label: 'Align Left', action: () => editor.chain().focus().setTextAlign('left').run(), isActive: () => currentTextAlign === 'left' },
      { type: 'button', icon: <AlignCenter />, label: 'Align Center', action: () => editor.chain().focus().setTextAlign('center').run(), isActive: () => currentTextAlign === 'center' },
      { type: 'button', icon: <AlignRight />, label: 'Align Right', action: () => editor.chain().focus().setTextAlign('right').run(), isActive: () => currentTextAlign === 'right' },
      { type: 'button', icon: <AlignJustify />, label: 'Align Justify', action: () => editor.chain().focus().setTextAlign('justify').run(), isActive: () => currentTextAlign === 'justify' },
    ],
    [
      { type: 'button', icon: <List />, label: 'Bulleted List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => isBulletListActive },
      { type: 'button', icon: <ListOrdered />, label: 'Numbered List', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => isOrderedListActive },
      { type: 'button', icon: <Quote />, label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => isBlockquoteActive },
      { type: 'button', icon: <Code2 />, label: 'Code Block', action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: () => isCodeBlockActive },
    ],
    [
      { type: 'button', icon: <Minus />, label: 'Horizontal Rule', action: () => editor.chain().focus().setHorizontalRule().run(), isActive: () => false },
      { type: 'button', icon: <ImageUp />, label: 'Insert Image', action: handleImageInsert, isActive: () => false },
      { type: 'button', icon: <Feather />, label: 'Write a Letter', action: handleLetterInsert, isActive: () => false },
    ],
    [
      { type: 'button', icon: <Undo2 />, label: 'Undo', action: () => editor.chain().focus().undo().run(), isActive: () => false, disabled: !canUndo },
      { type: 'button', icon: <Redo2 />, label: 'Redo', action: () => editor.chain().focus().redo().run(), isActive: () => false, disabled: !canRedo },
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
      <div className="flex flex-col gap-2 w-full items-center">
        <div className="flex flex-wrap gap-1 items-center justify-center">
          {toolGroups.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {group.length > 0 && group.map((tool) => {
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
                      disabled={(tool as any).disabled || editor.isDestroyed || !editor.isEditable}
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
                          disabled={editor.isDestroyed || !editor.isEditable}
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
                                item.icon 
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
              {groupIndex < toolGroups.length - 1 && group.length > 0 && (
                <Separator orientation="vertical" className="h-6 mx-1" />
              )}
            </React.Fragment>
          ))}
        </div>
        {/* Removed the conditional rendering block for image width input */}
      </div>
    </>
  );
};

export default HomeTools;
