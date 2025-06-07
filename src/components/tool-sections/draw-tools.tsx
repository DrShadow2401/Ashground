
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  PenTool,
  Brush,
  Eraser,
  Undo2,
  SlidersHorizontal,
  Circle,
  Square,
  Triangle,
  Minus,
  ArrowRight,
  PaintBucket,
  Palette,
  Pipette,
  ListFilter,
} from 'lucide-react';

const DrawTools: React.FC = () => {
  const toolGroups = [
    [
      { icon: <PenTool />, label: 'Pen' },
      { icon: <Brush />, label: 'Brush' },
      { icon: <Eraser />, label: 'Eraser' },
      { icon: <Undo2 />, label: 'Undo' },
    ],
    [
      { icon: <Circle />, label: 'Draw Circle' },
      { icon: <Square />, label: 'Draw Square' },
      { icon: <Triangle />, label: 'Draw Triangle' },
      { icon: <Minus />, label: 'Draw Line' },
      { icon: <ArrowRight />, label: 'Draw Arrow' },
    ],
    [
      { icon: <PaintBucket />, label: 'Fill Tool' },
      { icon: <Palette />, label: 'Color Palette' },
      { icon: <Pipette />, label: 'Eyedropper Tool' },
    ],
    [
      { icon: <SlidersHorizontal />, label: 'Brush Size' },
      { icon: <ListFilter />, label: 'Line Styles (Dotted, Dashed, Solid)' },
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

export default DrawTools;
