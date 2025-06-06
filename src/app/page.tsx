'use client';

import React, { useState, useEffect } from 'react';
import AshgroundHeader from '@/components/ashground-header';
import PageEditor from '@/components/page-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomeTools from '@/components/tool-sections/home-tools';
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
  
  // Avoid hydration mismatch for localStorage
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
    // Optional: render a loading state or null
    return null; 
  }

  const tabItems = [
    { value: 'home', label: 'Home' },
    { value: 'draw', label: 'Draw' },
    { value: 'view', label: 'View' },
    { value: 'export', label: 'Export' },
  ];

  return (
    <main className="flex flex-col items-center min-h-screen py-6 md:py-10 px-4">
      <AshgroundHeader />

      <div className="w-full max-w-4xl mt-6 md:mt-8">
        <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="frosted-tabs-list mx-auto w-fit">
            {tabItems.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="frosted-tab-trigger">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-6 p-4 rounded-lg shadow-lg bg-card/60 dark:bg-card/60 backdrop-blur-sm border border-foreground/10 min-h-[80px] mb-8">
            <TabsContent value="home" className="mt-0"><HomeTools /></TabsContent>
            <TabsContent value="draw" className="mt-0"><DrawTools /></TabsContent>
            <TabsContent value="view" className="mt-0">
              <ViewTools
                selectedBackground={pageBackground}
                onBackgroundChange={setPageBackground}
                selectedTheme={pageTheme}
                onThemeChange={setPageTheme}
              />
            </TabsContent>
            <TabsContent value="export" className="mt-0"><ExportTools noteContent={noteContent} /></TabsContent>
          </div>
        </Tabs>
      </div>

      <PageEditor
        noteContent={noteContent}
        onNoteChange={setNoteContent}
        backgroundStyle={pageBackground}
        pageTheme={pageTheme}
      />
    </main>
  );
}
