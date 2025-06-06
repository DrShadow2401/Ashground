
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { FileText, ListChecks, LayoutGrid, Sun, Moon, Palette } from 'lucide-react';

type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';

interface ViewToolsProps {
  selectedBackground: PageBackground;
  onBackgroundChange: (background: PageBackground) => void;
  selectedTheme: PageTheme;
  onThemeChange: (theme: PageTheme) => void;
}

const ViewTools: React.FC<ViewToolsProps> = ({
  selectedBackground,
  onBackgroundChange,
  selectedTheme,
  onThemeChange,
}) => {
  const backgroundOptions: { value: PageBackground; label: string; icon: React.ReactNode }[] = [
    { value: 'plain', label: 'Plain', icon: <FileText className="w-4 h-4 mr-2" /> },
    { value: 'lined', label: 'Lined', icon: <ListChecks className="w-4 h-4 mr-2" /> },
    { value: 'grid', label: 'Grid', icon: <LayoutGrid className="w-4 h-4 mr-2" /> },
  ];

  const themeOptions: { value: PageTheme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4 mr-2" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4 mr-2" /> },
    { value: 'pastel', label: 'Pastel', icon: <Palette className="w-4 h-4 mr-2" /> },
  ];

  return (
    <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
      {backgroundOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedBackground === option.value ? "secondary" : "ghost"}
          onClick={() => onBackgroundChange(option.value)}
          className="flex items-center hover:bg-accent/50"
          aria-label={option.label}
          title={option.label}
          aria-pressed={selectedBackground === option.value}
        >
          {option.icon}
          {option.label}
        </Button>
      ))}

      <Separator orientation="vertical" className="h-6 mx-1 sm:mx-2" />

      {themeOptions.map((option) => (
         <Button
          key={option.value}
          variant={selectedTheme === option.value ? "secondary" : "ghost"}
          onClick={() => onThemeChange(option.value)}
          className="flex items-center hover:bg-accent/50"
          aria-label={option.label}
          title={option.label}
          aria-pressed={selectedTheme === option.value}
        >
          {option.icon}
          {option.label}
        </Button>
      ))}
    </div>
  );
};

export default ViewTools;
