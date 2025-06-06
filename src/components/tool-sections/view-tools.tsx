
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
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
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium mb-2 block text-center sm:text-left">Page Background</Label>
        <RadioGroup value={selectedBackground} onValueChange={(value) => onBackgroundChange(value as PageBackground)} className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {backgroundOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedBackground === option.value ? "secondary" : "ghost"}
              onClick={() => onBackgroundChange(option.value)}
              className="flex items-center"
              aria-pressed={selectedBackground === option.value}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block text-center sm:text-left">Page Theme</Label>
         <RadioGroup value={selectedTheme} onValueChange={(value) => onThemeChange(value as PageTheme)} className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {themeOptions.map((option) => (
             <Button
              key={option.value}
              variant={selectedTheme === option.value ? "secondary" : "ghost"}
              onClick={() => onThemeChange(option.value)}
              className="flex items-center"
              aria-pressed={selectedTheme === option.value}
            >
              {option.icon}
              {option.label}
            </Button>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};

export default ViewTools;
