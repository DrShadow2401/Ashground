
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  PenTool,
  Eraser,
  Undo2, 
  Trash2, 
  Palette,
  PaintBucket, // Keeping for Fill, but disabled
  Circle as CircleIcon, // Renamed to avoid conflict with React.Circle
  Square as SquareIcon, // Renamed
  Triangle as TriangleIcon, // Renamed
  Minus as MinusIcon, // Renamed
  ArrowRight as ArrowRightIcon, // Renamed
  SlidersHorizontal, // Placeholder for Brush Size / Line Styles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawToolsProps {
  activeTool: string | null;
  onToolChange: (tool: string | null) => void;
  currentDrawColor: string;
  onDrawColorChange: (color: string) => void;
  currentStrokeWidth: number;
  onStrokeWidthChange: (width: number) => void;
  onClearCanvas: () => void;
}

const drawColors = ['#000000', '#EF4444', '#3B82F6', '#22C55E', '#F97316', '#A855F7'];
const strokeWidths = [2, 4, 8, 12];

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
    // { name: 'undo', icon: <Undo2 />, label: 'Undo (NA)', disabled: true }, // Undo for drawing is complex
  ];

  const shapeToolButtons = [
    { name: 'circle', icon: <CircleIcon />, label: 'Draw Circle (NA)', disabled: true },
    { name: 'square', icon: <SquareIcon />, label: 'Draw Square (NA)', disabled: true },
    { name: 'triangle', icon: <TriangleIcon />, label: 'Draw Triangle (NA)', disabled: true },
    { name: 'line', icon: <MinusIcon />, label: 'Draw Line (NA)', disabled: true },
    { name: 'arrow', icon: <ArrowRightIcon />, label: 'Draw Arrow (NA)', disabled: true },
  ];

  const otherDrawingTools = [
     { name: 'fill', icon: <PaintBucket />, label: 'Fill Tool (NA)', disabled: true },
    //  { name: 'eyedropper', icon: <Pipette />, label: 'Eyedropper Tool (NA)', disabled: true },
    //  { name: 'lineStyles', icon: <ListFilter />, label: 'Line Styles (NA)', disabled: true },
  ];


  return (
    <div className="flex flex-wrap gap-1 items-center justify-center">
      {/* Drawing Mode Tools */}
      {drawingToolButtons.map((tool) => (
        <Button
          variant="ghost"
          size="icon"
          key={tool.label}
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
      
      {/* Color Selection */}
      {drawColors.map(color => (
        <Button
          key={color}
          variant="outline"
          size="icon"
          title={`Color: ${color}`}
          onClick={() => onDrawColorChange(color)}
          className={cn(
            'w-6 h-6 p-0 rounded-full border-2 hover:border-primary',
            currentDrawColor === color ? 'border-primary ring-2 ring-ring ring-offset-2' : 'border-transparent'
          )}
          style={{ backgroundColor: color }}
        />
      ))}
      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Stroke Width Selection */}
      {strokeWidths.map(width => (
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
            <div className={cn("rounded-full bg-foreground")} style={{width: `${width+2 > 10 ? 10 : width+2}px`, height: `${width+2 > 10 ? 10 : width+2}px`}}/>
          </div>
        </Button>
      ))}
       <Separator orientation="vertical" className="h-6 mx-1" />


      {/* Shape Tools (Disabled) */}
      {shapeToolButtons.map((tool) => (
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
