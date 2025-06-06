import React from 'react';
import { Button } from '@/components/ui/button';
import { PenTool, Brush, Eraser, Undo2, SlidersHorizontal } from 'lucide-react';

const DrawTools: React.FC = () => {
  const tools = [
    { icon: <PenTool />, label: 'Pen' },
    { icon: <Brush />, label: 'Brush' },
    { icon: <SlidersHorizontal />, label: 'Brush Size' },
    { icon: <Eraser />, label: 'Eraser' },
    { icon: <Undo2 />, label: 'Undo' },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-2 items-center">
      {tools.map((tool) => (
        <Button variant="ghost" size="icon" key={tool.label} aria-label={tool.label} title={tool.label} className="hover:bg-accent/50">
          {tool.icon}
        </Button>
      ))}
    </div>
  );
};

export default DrawTools;
