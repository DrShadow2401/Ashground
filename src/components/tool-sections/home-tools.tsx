import React from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline, List, AlignLeft } from 'lucide-react';

const HomeTools: React.FC = () => {
  const tools = [
    { icon: <Bold />, label: 'Bold' },
    { icon: <Italic />, label: 'Italic' },
    { icon: <Underline />, label: 'Underline' },
    { icon: <List />, label: 'Bullet List' },
    { icon: <AlignLeft />, label: 'Align Left' },
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

export default HomeTools;
