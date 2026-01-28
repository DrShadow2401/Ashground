
import React from 'react';
import { Button } from '@/components/ui/button';
import { Feather } from 'lucide-react';

interface LetterToolsProps {
  onInsertTemplate: () => void;
}

const LetterTools: React.FC<LetterToolsProps> = ({ onInsertTemplate }) => {
  return (
    <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start">
      <Button onClick={onInsertTemplate} variant="outline" className="hover:bg-accent/50">
        <Feather className="mr-2 h-4 w-4" />
        Insert Letter Template
      </Button>
    </div>
  );
};

export default LetterTools;
