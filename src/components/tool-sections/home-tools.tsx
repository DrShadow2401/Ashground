
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold,
  Italic,
  Underline,
  List,
  AlignLeft,
  Heading1,
  Baseline,
  Highlighter,
  Strikethrough,
  Subscript,
  Superscript,
  Code2,
  Quote,
  Link,
  ListOrdered,
  CheckSquare,
  Table2,
  Minus,
  ChevronsUpDown,
  ImageUp,
} from 'lucide-react';

const HomeTools: React.FC = () => {
  const toolGroups = [
    [
      { icon: <Bold />, label: 'Bold' },
      { icon: <Italic />, label: 'Italic' },
      { icon: <Underline />, label: 'Underline' },
      { icon: <Strikethrough />, label: 'Strikethrough' },
      { icon: <Highlighter />, label: 'Highlight' },
    ],
    [
      { icon: <Baseline />, label: 'Font Color' },
      { icon: <Heading1 />, label: 'Heading 1' },
      { icon: <Subscript />, label: 'Subscript' },
      { icon: <Superscript />, label: 'Superscript' },
    ],
    [
      { icon: <Quote />, label: 'Blockquote' },
      { icon: <Code2 />, label: 'Code Block' },
      { icon: <Link />, label: 'Insert Link' },
    ],
    [
      { icon: <List />, label: 'Bulleted List' },
      { icon: <ListOrdered />, label: 'Numbered List' },
      { icon: <CheckSquare />, label: 'Checklist' },
      { icon: <AlignLeft />, label: 'Align Left' },
    ],
    [
      { icon: <Table2 />, label: 'Insert Table' },
      { icon: <Minus />, label: 'Horizontal Rule' },
      { icon: <ChevronsUpDown />, label: 'Toggle/Collapsible Section' },
      { icon: <ImageUp />, label: 'Insert Image' },
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
              aria-label={tool.label}
              title={tool.label}
              className="hover:bg-accent/50"
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
