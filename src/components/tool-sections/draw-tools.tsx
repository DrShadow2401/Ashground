
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  PenTool,
  Brush, // Placeholder, PenTool is used for basic drawing
  Eraser, // Placeholder
  Undo2, // Placeholder
  SlidersHorizontal, // Placeholder for Brush Size
  Circle, // Placeholder
  Square, // Placeholder
  Triangle, // Placeholder
  Minus, // Placeholder for Line
  ArrowRight, // Placeholder for Arrow
  PaintBucket, // Placeholder
  Palette, // Placeholder
  Pipette, // Placeholder
  ListFilter, // Placeholder for Line Styles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawToolsProps {
  activeTool: string | null;
  onToolChange: (tool: string | null) => void;
  // Add props for color picker, brush size etc. later
}

const DrawTools: React.FC<DrawToolsProps> = ({ activeTool, onToolChange }) => {
  
  const handleToolClick = (toolName: string) => {
    onToolChange(activeTool === toolName ? null : toolName);
  };

  // Initial groups, Pen tool is the only functional one for now
  const toolGroups = [
    [
      { name: 'pen', icon: <PenTool />, label: 'Pen' },
      { name: 'brush', icon: <Brush />, label: 'Brush (NA)', disabled: true },
      { name: 'eraser', icon: <Eraser />, label: 'Eraser (NA)', disabled: true },
      { name: 'undo', icon: <Undo2 />, label: 'Undo (NA)', disabled: true },
    ],
    [
      { name: 'circle', icon: <Circle />, label: 'Draw Circle (NA)', disabled: true },
      { name: 'square', icon: <Square />, label: 'Draw Square (NA)', disabled: true },
      { name: 'triangle', icon: <Triangle />, label: 'Draw Triangle (NA)', disabled: true },
      { name: 'line', icon: <Minus />, label: 'Draw Line (NA)', disabled: true },
      { name: 'arrow', icon: <ArrowRight />, label: 'Draw Arrow (NA)', disabled: true },
    ],
    [
      { name: 'fill', icon: <PaintBucket />, label: 'Fill Tool (NA)', disabled: true },
      { name: 'palette', icon: <Palette />, label: 'Color Palette (NA)', disabled: true },
      { name: 'eyedropper', icon: <Pipette />, label: 'Eyedropper Tool (NA)', disabled: true },
    ],
    [
      { name: 'brushSize', icon: <SlidersHorizontal />, label: 'Brush Size (NA)', disabled: true },
      { name: 'lineStyles', icon: <ListFilter />, label: 'Line Styles (NA)', disabled: true },
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
              onClick={() => handleToolClick(tool.name)}
              aria-label={tool.label}
              title={tool.label}
              className={cn(
                'hover:bg-accent/50',
                activeTool === tool.name ? 'bg-accent text-accent-foreground' : ''
              )}
              disabled={tool.disabled}
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
