
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  PenTool,
  Eraser, // Added Eraser icon
  Trash2,
  Palette,
  ListFilter,
  Undo2, // Added Undo icon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import type { LineStyle } from '@/app/ashground-app'; // Updated path

interface DrawToolsProps {
  activeTool: string | null;
  onToolChange: (tool: string | null) => void;
  currentDrawColor: string;
  onDrawColorChange: (color: string) => void;
  currentStrokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  currentLineStyle: LineStyle;
  onLineStyleChange: (style: LineStyle) => void;
  onClearCanvas: () => void;
  onUndoDrawing: () => void; // Added prop for undo
  canUndoDrawing: boolean; // Added prop to enable/disable undo
}

const presetDrawColors = ['#000000', '#EF4444', '#3B82F6', '#22C55E', '#F97316', '#A855F7', '#FFFFFF'];
const presetStrokeWidths = [2, 4, 8, 12, 16];
const lineStyleOptions: { label: string; value: LineStyle }[] = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
];


const DrawTools: React.FC<DrawToolsProps> = ({
  activeTool,
  onToolChange,
  currentDrawColor,
  onDrawColorChange,
  currentStrokeWidth,
  onStrokeWidthChange,
  currentLineStyle,
  onLineStyleChange,
  onClearCanvas,
  onUndoDrawing,
  canUndoDrawing,
}) => {

  const handleToolClick = (toolName: string) => {
    if (toolName === 'clear') {
      onClearCanvas();
      // Optionally deactivate current tool if clear is clicked
      // onToolChange(null); 
      return;
    }
    if (toolName === 'undo') {
      onUndoDrawing();
      // Undo should not change the active tool
      return;
    }
    onToolChange(activeTool === toolName ? null : toolName);
  };

  const drawingToolButtons = [
    { name: 'pen', icon: <PenTool />, label: 'Pen' },
    { name: 'eraser', icon: <Eraser />, label: 'Eraser' },
  ];

  return (
    <div className="flex flex-wrap gap-1 items-center justify-center">
      {drawingToolButtons.map((tool) => (
        <Button
          variant="ghost"
          size="icon"
          key={tool.name}
          onClick={() => handleToolClick(tool.name)}
          aria-label={tool.label}
          title={tool.label}
          className={cn(
            'hover:bg-accent/50',
            activeTool === tool.name ? 'bg-accent text-accent-foreground' : '',
          )}
        >
          {React.cloneElement(tool.icon, { size: 20 })}
        </Button>
      ))}
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      <Button
        variant="ghost"
        size="icon"
        title="Undo Drawing"
        onClick={() => handleToolClick('undo')}
        disabled={!canUndoDrawing}
        className="hover:bg-accent/50 disabled:opacity-50"
      >
        <Undo2 size={20} />
      </Button>
      <Separator orientation="vertical" className="h-6 mx-1" />


      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Select Draw Color" className="hover:bg-accent/50">
            <Palette size={20}/>
            <div className="w-3 h-3 ml-1 rounded-sm border" style={{ backgroundColor: currentDrawColor }} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Brush Color</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {presetDrawColors.map(color => (
            <DropdownMenuItem key={color} onClick={() => onDrawColorChange(color)} className={cn(currentDrawColor === color ? 'bg-accent/80' : '')}>
              <div className="w-4 h-4 rounded-full border mr-2" style={{ backgroundColor: color }} />
              {color === '#FFFFFF' ? 'White' : color === '#000000' ? 'Black' : color}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Separator orientation="vertical" className="h-6 mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Select Stroke Width" className="hover:bg-accent/50">
            <div className="flex items-center justify-center w-full h-full">
              <div className={cn("rounded-full bg-foreground")} style={{ width: `${Math.min(currentStrokeWidth + 2, 12)}px`, height: `${Math.min(currentStrokeWidth + 2, 12)}px` }} />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Stroke Width</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {presetStrokeWidths.map(width => (
            <DropdownMenuItem key={`stroke-${width}`} onClick={() => onStrokeWidthChange(width)} className={cn(currentStrokeWidth === width ? 'bg-accent/80' : '')}>
              <div className="w-5 h-5 flex items-center justify-center mr-2">
                <div className={cn("rounded-full bg-foreground")} style={{ width: `${Math.min(width + 2, 12)}px`, height: `${Math.min(width + 2, 12)}px` }} />
              </div>
              {width}px
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="h-6 mx-1" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Select Line Style" className="hover:bg-accent/50">
            <ListFilter size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Line Style</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {lineStyleOptions.map(style => (
            <DropdownMenuItem key={style.value} onClick={() => onLineStyleChange(style.value)} className={cn(currentLineStyle === style.value ? 'bg-accent/80' : '')}>
              {style.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Separator orientation="vertical" className="h-6 mx-1" />

      <Button
        variant="outline"
        size="icon"
        title="Clear Drawing"
        onClick={() => handleToolClick('clear')}
        className="hover:bg-destructive/20"
      >
        <Trash2 size={20}/>
      </Button>
    </div>
  );
};

export default DrawTools;
