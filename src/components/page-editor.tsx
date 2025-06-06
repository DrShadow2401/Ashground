
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';

interface PageEditorProps {
  noteContent: string;
  onNoteChange: (content: string) => void;
  backgroundStyle: PageBackground;
  pageTheme: PageTheme;
}

const PageEditor: React.FC<PageEditorProps> = ({
  noteContent,
  onNoteChange,
  backgroundStyle,
  pageTheme,
}) => {
  const themeClassMap: Record<PageTheme, string> = {
    light: 'page-theme-light',
    dark: 'page-theme-dark',
    pastel: 'page-theme-pastel',
  };

  const backgroundClassMap: Record<PageBackground, string> = {
    plain: '',
    lined: 'page-bg-lined',
    grid: 'page-bg-grid',
  };

  const placeholderText = `Start writing your thoughts here...\nThis is your aesthetic, single-page note space — minimal, classy, no distractions.\n\n*Nothing is saved. Everything burns.*`;

  const textAreaPaddingTop = "pt-[1.125rem]";

  return (
    <div
      className={cn(
        'w-full max-w-3xl mx-auto p-8 md:p-12 rounded-xl shadow-xl min-h-[60vh] flex flex-col transition-colors duration-300',
        themeClassMap[pageTheme]
      )}
    >
      <h2 className="font-headline text-3xl md:text-4xl mb-6 pb-2 border-b border-[hsl(var(--line-color))]">
        Untitled Note
      </h2>
      <div
        className={cn(
          'flex-grow relative', // This div will take the remaining space and host the background
          backgroundClassMap[backgroundStyle]
        )}
      >
        <Textarea
          value={noteContent}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder={placeholderText}
          className={cn(
            "w-full h-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed font-body resize-none",
            textAreaPaddingTop
          )}
        />
      </div>
    </div>
  );
};

export default PageEditor;
