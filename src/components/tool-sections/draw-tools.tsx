
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  PenTool,
  Eraser,
  Trash2, 
  Palette, // For color picker trigger
  PaintBucket, // Keeping for Fill, but disabled
  Circle as CircleIcon, 
  Square as SquareIcon, 
  Triangle as TriangleIcon, 
  Minus as MinusIcon, 
  ArrowRight as ArrowRightIcon, 
  Pipette, // Eyedropper (NA)
  ListFilter, // Line Styles (NA)
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DrawToolsProps {
  activeTool: string | null;
  onToolChange: (tool: string | null) => void;
  currentDrawColor: string;
  onDrawColorChange: (color: string) => void;
  currentStrokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onClearCanvas: () => void;
}

const presetDrawColors = ['#000000', '#EF4444', '#3B82F6', '#22C55E', '#F97316', '#A855F7', '#FFFFFF'];
const presetStrokeWidths = [2, 4, 8, 12, 16];

const DrawTools: React.FC<DrawToolsProps> = ({ 
  activeTool, 
  onToolChange,
  currentDrawColor,
  onDrawColorChange,
  currentStrokeWidth,
  onStrokeWidthChange,
  onClearCanvas
}) => {
  
  const handleToolClick = (toolName: string) => {
    onToolChange(activeTool === toolName ? null : toolName);
  };

  const drawingToolButtons = [
    { name: 'pen', icon: <PenTool />, label: 'Pen' },
    { name: 'eraser', icon: <Eraser />, label: 'Eraser' },
  ];

  const shapeToolButtons = [
    { name: 'circle', icon: <CircleIcon />, label: 'Draw Circle' },
    { name: 'square', icon: <SquareIcon />, label: 'Draw Square' },
    { name: 'triangle', icon: <TriangleIcon />, label: 'Draw Triangle' },
    { name: 'line', icon: <MinusIcon />, label: 'Draw Line' }, // Simple line
    { name: 'arrow', icon: <ArrowRightIcon />, label: 'Draw Arrow' }, // Simple arrow
  ];

  const otherDrawingTools = [
     { name: 'fill', icon: <PaintBucket />, label: 'Fill Tool (NA)', disabled: true },
     { name: 'eyedropper', icon: <Pipette />, label: 'Eyedropper Tool (NA)', disabled: true },
     { name: 'lineStyles', icon: <ListFilter />, label: 'Line Styles (NA)', disabled: true },
  ];


  return (
    <div className="flex flex-wrap gap-1 items-center justify-center">
      {/* Drawing Mode Tools */}
      {drawingToolButtons.map((tool) => (
        <Button
          variant="ghost"
          size="icon"
          key={tool.name} // Use name for key as label might change
          onClick={() => handleToolClick(tool.name)}
          aria-label={tool.label}
          title={tool.label}
          className={cn(
            'hover:bg-accent/50',
            activeTool === tool.name ? 'bg-accent text-accent-foreground' : '',
            (tool as any).disabled ? 'opacity-50 cursor-not-allowed' : ''
          )}
          disabled={(tool as any).disabled}
        >
          {tool.icon}
        </Button>
      ))}
      <Separator orientation="vertical" className="h-6 mx-1" />
      
      {/* Color Selection Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" title="Select Draw Color" className="hover:bg-accent/50">
            <Palette />
             <div className="w-3 h-3 ml-1 rounded-sm border" style={{ backgroundColor: currentDrawColor }}/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {presetDrawColors.map(color => (
            <DropdownMenuItem key={color} onClick={() => onDrawColorChange(color)} className={cn(currentDrawColor === color ? 'bg-accent/80' : '')}>
              <div className="w-3 h-3 rounded-full border mr-2" style={{ backgroundColor: color }} />
              {color}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Stroke Width Selection */}
      {presetStrokeWidths.map(width => (
        <Button
          key={`stroke-${width}`}
          variant="ghost"
          size="icon"
          title={`Stroke width: ${width}px`}
          onClick={() => onStrokeWidthChange(width)}
          className={cn(
            'hover:bg-accent/50',
            currentStrokeWidth === width ? 'bg-accent text-accent-foreground' : ''
          )}
        >
          <div className="flex items-center justify-center w-full h-full">
            <div className={cn("rounded-full bg-foreground")} style={{width: `${width+2 > 12 ? 12 : width+2}px`, height: `${width+2 > 12 ? 12 : width+2}px`}}/>
          </div>
        </Button>
      ))}
       <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Shape Tools */}
      {shapeToolButtons.map((tool) => (
        <Button
          variant="ghost"
          size="icon"
          key={tool.name} // Use name for key
          onClick={() => handleToolClick(tool.name)}
          aria-label={tool.label}
          title={tool.label}
          className={cn(
            'hover:bg-accent/50',
            activeTool === tool.name ? 'bg-accent text-accent-foreground' : '',
            (tool as any).disabled ? 'opacity-50 cursor-not-allowed' : ''
          )}
          disabled={(tool as any).disabled}
        >
          {tool.icon}
        </Button>
      ))}
       <Separator orientation="vertical" className="h-6 mx-1" />
      {/* Other Tools (Disabled) */}
      {otherDrawingTools.map((tool) => (
         <Button
          variant="ghost"
          size="icon"
          key={tool.label}
          aria-label={tool.label}
          title={tool.label}
          className={cn(
            'hover:bg-accent/50 opacity-50 cursor-not-allowed'
          )}
          disabled
        >
          {tool.icon}
        </Button>
      ))}
      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Clear Canvas */}
      <Button
        variant="outline"
        size="icon"
        title="Clear Drawing"
        onClick={onClearCanvas}
        className="hover:bg-destructive/20"
      >
        <Trash2 />
      </Button>
    </div>
  );
};

export default DrawTools;
