
'use client';

import React, { useState, useEffect } from 'react';
import AshgroundHeader from '@/components/ashground-header';
import PageEditor from '@/components/page-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// HomeTools is not used when PageEditor is directly in the Home tab content.
// import HomeTools from '@/components/tool-sections/home-tools'; 
import DrawTools from '@/components/tool-sections/draw-tools';
import ViewTools from '@/components/tool-sections/view-tools';
import ExportTools from '@/components/tool-sections/export-tools';
import { cn } from '@/lib/utils';

type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';

export default function Home() {
  const [noteContent, setNoteContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [pageBackground, setPageBackground] = useState<PageBackground>('plain');
  const [pageTheme, setPageTheme] = useState<PageTheme>('light');
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedNote = localStorage.getItem('ashground_note');
    const savedBg = localStorage.getItem('ashground_bg') as PageBackground | null;
    const savedTheme = localStorage.getItem('ashground_theme') as PageTheme | null;

    if (savedNote) setNoteContent(savedNote);
    if (savedBg) setPageBackground(savedBg);
    if (savedTheme) setPageTheme(savedTheme);
  }, []);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('ashground_note', noteContent);
    }
  }, [noteContent, isMounted]);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('ashground_bg', pageBackground);
    }
  }, [pageBackground, isMounted]);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('ashground_theme', pageTheme);
    }
  }, [pageTheme, isMounted]);

  if (!isMounted) {
    // Render nothing or a loading indicator SSR/hydration mismatch
    return null; 
  }

  const tabItems = [
    { value: 'home', label: 'Home' },
    { value: 'draw', label: 'Draw' },
    { value: 'view', label: 'View' },
    { value: 'export', label: 'Export' },
  ];

  return (
    <main className="flex flex-col items-center min-h-screen py-6 px-4">
      <AshgroundHeader />

      <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mt-3 md:mt-4">
        <TabsList className="mx-auto w-full max-w-sm bg-card rounded-xl shadow-lg p-1.5 mb-8 flex justify-around items-center">
          {tabItems.map(tab => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              className="px-3 py-1.5 data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground/80 transition-colors rounded-md text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="home" className="mt-0">
          {/* PageEditor is now directly part of the "Home" tab content */}
          <PageEditor
            noteContent={noteContent}
            onNoteChange={setNoteContent}
            backgroundStyle={pageBackground} 
            pageTheme={pageTheme} 
          />
        </TabsContent>
        <TabsContent value="draw" className="mt-0">
          <div className="p-4 rounded-lg shadow-lg bg-card min-h-[120px]  max-w-3xl mx-auto">
            <DrawTools />
          </div>
        </TabsContent>
        <TabsContent value="view" className="mt-0">
           <div className="p-4 rounded-lg shadow-lg bg-card min-h-[120px]  max-w-3xl mx-auto">
            <ViewTools
              selectedBackground={pageBackground}
              onBackgroundChange={setPageBackground}
              selectedTheme={pageTheme}
              onThemeChange={setPageTheme}
            />
          </div>
        </TabsContent>
        <TabsContent value="export" className="mt-0">
          <div className="p-4 rounded-lg shadow-lg bg-card min-h-[120px]  max-w-3xl mx-auto">
            <ExportTools noteContent={noteContent} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
