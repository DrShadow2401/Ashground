
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
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

  // Local state for button active states
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

  // Image specific state
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [imageWidthInput, setImageWidthInput] = useState('');


  const handleTransactionOrSelectionUpdate = useCallback(() => {
    const editor = editorRef.current;
    if (!editor || editor.isDestroyed) return;

    setIsBoldActive(editor.isActive('bold'));
    setIsItalicActive(editor.isActive('italic'));
    setIsUnderlineActive(editor.isActive('underline'));
    setIsStrikeActive(editor.isActive('strike'));
    setIsSuperscriptActive(editor.isActive('superscript'));
    setIsSubscriptActive(editor.isActive('subscript'));

    if (editor.isActive('heading', { level: 1 })) setCurrentHeadingLevel(1);
    else if (editor.isActive('heading', { level: 2 })) setCurrentHeadingLevel(2);
    else if (editor.isActive('heading', { level: 3 })) setCurrentHeadingLevel(3);
    else setCurrentHeadingLevel(0);

    setCurrentTextColor(editor.getAttributes('textStyle').color || null);
    setCurrentHighlightColor(editor.getAttributes('highlight')?.color || null);
    
    if (editor.isActive({ textAlign: 'left' })) setCurrentTextAlign('left');
    else if (editor.isActive({ textAlign: 'center' })) setCurrentTextAlign('center');
    else if (editor.isActive({ textAlign: 'right' })) setCurrentTextAlign('right');
    else if (editor.isActive({ textAlign: 'justify' })) setCurrentTextAlign('justify');
    else setCurrentTextAlign(null);

    setIsBulletListActive(editor.isActive('bulletList'));
    setIsOrderedListActive(editor.isActive('orderedList'));
    setIsBlockquoteActive(editor.isActive('blockquote'));
    setIsCodeBlockActive(editor.isActive('codeBlock'));

    setCanUndo(editor.can().undo());
    setCanRedo(editor.can().redo());

    // Image specific updates
    if (editor.isActive('image')) {
      const attrs = editor.getAttributes('image') as { src: string; alt?: string; title?: string; width?: string | number; height?: string | number };
      setImageWidthInput(attrs.width != null ? String(attrs.width) : '');
      setIsImageSelected(true);
    } else {
      setIsImageSelected(false);
      setImageWidthInput('');
    }
  }, [editorRef]);


  useEffect(() => {
    const currentEditor = editorRef.current;
    if (!currentEditor || currentEditor.isDestroyed) {
      return;
    }
    
    // Initial update of states
    handleTransactionOrSelectionUpdate();
    
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
      currentEditor.chain().focus().setImage({ src: reader.result as string }).run();
    };
    reader.readAsDataURL(file);
    if (event.target) {
        event.target.value = '';
    }
  }, [editorRef]);

  const handleApplyImageWidth = useCallback(() => {
    const currentEditor = editorRef.current;
    if (!currentEditor || !isImageSelected || !currentEditor.isEditable || currentEditor.isDestroyed) return;

    let newWidthValue: string | number | null = imageWidthInput.trim();

    if (newWidthValue === '') {
      newWidthValue = null; 
    } else if (/^\d+$/.test(newWidthValue) && !newWidthValue.endsWith('%') && !newWidthValue.endsWith('px')) {
      newWidthValue = parseInt(newWidthValue, 10);
    }
    
    currentEditor.chain().focus().updateAttributes('image', {
      width: newWidthValue,
      height: null 
    }).run();
  }, [editorRef, isImageSelected, imageWidthInput]);

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
                                item.icon // For 'Default' option which uses an icon
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
        {isImageSelected && !editor.isDestroyed && (
          <div className="mt-2 p-2 border-t border-border w-full max-w-xs mx-auto">
            <div className="flex items-center gap-2">
              <label htmlFor="imageWidthInput" className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                Image Width:
              </label>
              <Input
                id="imageWidthInput"
                type="text"
                value={imageWidthInput}
                onChange={(e) => setImageWidthInput(e.target.value)}
                placeholder="e.g., 300 or 50%"
                className="h-8 text-sm"
                disabled={!editor || !editor.isEditable || editor.isDestroyed}
              />
              <Button
                onClick={handleApplyImageWidth}
                size="sm"
                variant="outline"
                className="h-8"
                disabled={!editor || !editor.isEditable || editor.isDestroyed}
              >
                Apply
              </Button>
            </div>
            <p className="text-xs text-muted-foreground/70 mt-1 text-center">
              Enter width (e.g., 300, 300px, 50%). Height auto-adjusts.
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default HomeTools;
